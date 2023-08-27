import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Confetti from "react-confetti";
import { Modal, Row, Container, Col } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import useWindowSize from "react-use/lib/useWindowSize";

import { socket } from "./socket";

import "./global.css";
import "./cointopright.css";

import { Notification, NotificationError, urlPrefix } from "./App.js";
import { NotLogged, Loading, CreateRoom, SelfMatches, generateDestroyerPhrase } from "./components/logged";
import FooterComponent from "./components/FooterComponent";
import HeaderButtons from "./components/HeaderComponents";

import { convertYocto, gettxsRes, menusayingsmult, processEvent, startup, getRooms, getRoomInfoFromTxs, joinMultiplayer, listenToRooms, storageRent, deleteMatch, genrandomphrase, closeRoom, sendpostwithplay } from "./utils";
import LOGOMAIN from "./assets/result.svg";
import LOGOBACK from "./assets/nearcoin.svg";
import FlipCoinMultiplayer from "./components/FlipCoinMultiplayer";
import Spectators from "./components/Spectators";

const contentStyle = {
	maxWidth: "35rem",
	width: "90%",
};

export default function Mult() {
	startup();
	const { width, height } = useWindowSize();

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [showNotification, setShowNotification] = React.useState(false);
	const [b, setBalance] = React.useState("");

	let msg = "";
	if (searchParams.get("errorCode")) {
		msg = decodeURI(searchParams.get("errorCode")) + ", " + decodeURI(searchParams.get("errorMessage")) + ".";
	}
	const [rooms, setRooms] = React.useState([]);

	const [errormsg, setErrormsg] = React.useState(msg);
	const [sideChoosen, setSideBet] = React.useState(null);
	const [ammoutNEAR, setBetAmmount] = React.useState(null);
	const [roomID, setRoomID] = React.useState(searchParams.get("room"));
	const [roomCreator, setRoomCreator] = React.useState(null);
	const [destroyer, setDestroyer] = React.useState(generateDestroyerPhrase(roomCreator?.replace(".near", "").replace(".testnet", "")));

	const [surprisePhrase, setSurprisePhrase] = React.useState(genrandomphrase());
	const [processing, setprocessing] = React.useState(true);

	const [accountWon, setAccountWon] = React.useState(null);
	const [sideResult, setSideResult] = React.useState(null);
	const [amountWon, setAmountWon] = React.useState(null);

	const [playersInRoom, setPlayersInRoom] = React.useState([]);

	const roomSetupfromTXS = (txsHashes) => {
		gettxsRes(txsHashes)
			.then((res) => {
				let nearbetstr = "";
				let returnedvalues = {};
				setShowNotification(true);
				console.log("res, telling server to update room:", res);

				// check if the transaction is valid
				try {
					let decodedstr = Buffer.from(res.status.SuccessValue, "base64").toString("ascii");
					//* join_match
					if (decodedstr === "true") {
						resetGame();
						return;
					}
					returnedvalues = JSON.parse(decodedstr);
					console.log("res:", returnedvalues);

					const roomid = returnedvalues.id;
					const winner = returnedvalues.winner;
					const result = returnedvalues.result === true ? "heads" : "tails";
					const creator = returnedvalues.creator;
					//parse near ammount
					if (roomid && winner && result && creator && returnedvalues.amount) {
						const ammount = convertYocto(
							returnedvalues.amount.toLocaleString("fullwide", {
								useGrouping: false,
							})
						);

						setAccountWon(winner);
						setSideResult(result);
						setRoomID(roomid);
						setAmountWon(ammount);
						setRoomCreator(creator);
						sendpostwithplay(txsHashes);
						return;
					}
				} catch (error) {
					console.log(error);
					setErrormsg("Error while decoding the transaction");
					setprocessing(false);
					return;
				}
				//* create_match

				// Simply join the room without flipped, happens when you created a room
				// check if room exists
				nearbetstr = convertYocto(
					returnedvalues.entry_price.toLocaleString("fullwide", {
						useGrouping: false,
					})
				);
				socket.emit("updateRooms");

				//set the info using the txs result
				setSideBet(returnedvalues.face);
				setBetAmmount(nearbetstr);
				setRoomID(returnedvalues.id);
				setRoomCreator(returnedvalues.creator);
				setprocessing(false);

				searchParams.set("room", returnedvalues.id);
				navigate(searchParams.toString());

				console.log("join room socket");
				socket.emit("playerJoinGame", {
					roomid: returnedvalues.id,
					account_id: window.accountId,
				});
			})
			.catch((e) => {
				console.log("err", e);
				setErrormsg("Error while decoding the transaction");
				setprocessing(false);
			});
	};

	const updateBal = () => {
		setBalance("");
		window.walletConnection
			.account()
			.getAccountBalance()
			.then((balance) => {
				let fullstr = convertYocto(balance.available).split(".");
				let str = fullstr[0] + "." + fullstr[1].substring(0, 4);
				setBalance("NEAR: " + str);
			})
			.catch((e) => {
				console.log("There has been a problem with getting your balance: " + e.message);
				setBalance("Couldn't Fetch Balance");
			})
			.finally(() => {
				// check if balance is null if so call updateBal again
				// console.log(b === "");
				if (b === null || b === "Couldn't Fetch Balance") {
					// wait 250 ms
					setTimeout(() => {
						updateBal();
					}, 250);
				}
			});
	};

	const resetGame = () => {
		searchParams.delete("transactionHashes");
		searchParams.delete("errorCode");
		searchParams.delete("errorMessage");
		searchParams.delete("room");
		navigate(searchParams.toString());

		setRoomID(null);
		setRoomCreator(null);
		setSideBet(null);
		setBetAmmount(null);
		setprocessing(true);

		setAccountWon(null);
		setSideResult(null);
		setAmountWon(null);

		console.log("reset game");
		// leave room
		socket.emit("playerLeavesGame", {
			roomid: roomID,
			account_id: window.accountId,
		});

		getRooms()
			.then((data) => {
				console.log(data);
				setRooms(data);
				setprocessing(false);
			})
			.catch((err) => {
				console.log(err);
				setErrormsg("Error while loading the rooms");
				setprocessing(false);
			});
	};

	const joinRoom = (roomId, ammount, roomCreator, sidetobet) => {
		setprocessing(true);

		const txsHashes = searchParams.get("transactionHashes");
		if (txsHashes) {
			roomSetupfromTXS(txsHashes);
			return;
		}
		// set Param to the url with roomID

		setDestroyer(generateDestroyerPhrase(ammount));
		setRoomID(roomId);

		setRoomCreator(roomCreator);
		setBetAmmount(ammount);
		setSideBet(sidetobet);
		searchParams.set("room", roomId);
		navigate(searchParams.toString());

		socket.emit("playerJoinGame", {
			roomid: roomId,
			account_id: window.accountId,
		});
		setprocessing(false);
	};
	/*
    console.log(ammoutNEAR)
    console.log("f", roomCreator === window.accountId)
    console.log(roomID !== null && ammoutNEAR !== null && sideChoosen !== null)
    console.log(!accountWon || !sideResult)
    */

	useEffect(() => {
		socket.connect();
		return () => {
			if (socket.readyState === 1) {
				socket.disconnect();
			}
		};
	}, []);

	useEffect(() => {
		const processRooms = (rooms) => {
			setRooms(rooms);
		};

		// in this case, we only care to query the contract when signed in
		if (window.walletConnection.isSignedIn()) {
			updateBal();
			const txsHashes = searchParams.get("transactionHashes");
			if (txsHashes) {
				roomSetupfromTXS(txsHashes);
				return;
			}

			getRooms()
				.then((data) => {
					console.log("rooms from fetch", data);
					setRooms(data);
					setprocessing(false);

					const roomId = searchParams.get("room");
					// get the room with the id
					if (roomId) {
						const room = data.find((room) => room.id === roomId);
						joinRoom(roomId, room.creator, room.entry_price, room.face);
						return;
					}

					listenToRooms(socket, processRooms, setPlayersInRoom);
				})
				.catch((err) => {
					console.log(err);
					setprocessing(false);
				});

			searchParams.delete("errorCode");
			searchParams.delete("errorMessage");
			navigate(searchParams.toString());
		}
	}, []);

	return (
		<>
			{showNotification && <Notification />}
			{errormsg && <NotificationError err={decodeURI(errormsg)} ismult={true} />}
			<HeaderButtons balance={b} />
			<div className="text-center body-wrapper">
				<div className="play form-signin">
					<div className="maincenter text-center" style={{ maxWidth: "34rem" }}>
						{!accountWon || !sideResult || !amountWon ? (
							<>
								{roomID !== null && ammoutNEAR !== null && sideChoosen !== null ? (
									<>
										{roomCreator === window.accountId ? (
											<>
												<div className="textinfoyellow font-weight-normal" style={{ fontSize: "2rem" }}>
													WAITING FOR OPPONENT
												</div>
												<span className="text-center rounded" style={{ color: "white", fontSize: "0.85rem" }}>
													Room ID: {roomID}
												</span>

												<div className="d-flex my-auto">
													<div className="flip-box mb-2 mx-auto h-full " style={{ width: "50%", marginTop: "20%" }}>
														<div className="d-flex justify-content-center flex-row borderpixelSMALL">
															<div
																className="flip-box-inner d-flex justify-content-center flex-column mx-auto my-auto"
																style={{
																	fontWeight: "500",
																	color: "white",
																	fontSize: "1.45rem",
																	width: "70%",
																}}
															>
																<span className="my-auto">Flip amount: {Math.round(ammoutNEAR * 1000000) / 1000000} Near</span>

																<span
																	className="text-center rounded"
																	style={{
																		color: "white",
																		fontSize: "0.75rem",
																	}}
																>
																	Playing as:{" "}
																	<a href={`${urlPrefix}/${window.accountId}`} target="_blank">
																		{window.accountId}
																	</a>
																</span>
															</div>
														</div>
													</div>
													<div className="flip-box logo mb-2 mx-auto" style={{ width: "40%", marginTop: "13%" }}>
														<div className={sideChoosen === true ? "flip-box-inner my-auto" : "flip-box-inner-flipped my-auto"}>
															<div className="flip-box-front ">
																<img src={LOGOMAIN} alt="logo" width="220" height="220" />
															</div>
															<div className="flip-box-back">
																<img src={LOGOBACK} alt="logoback" width="220" height="220" />
															</div>
														</div>
													</div>
												</div>
												<div className="d-flex my-auto justify-content-between">
													<button
														className="align-self-start button button-retro is-error"
														disabled={processing}
														onClick={() => {
															closeRoom(roomID, setprocessing, setShowNotification, resetGame, setErrormsg, socket).then(() => {
																updateBal();
															});
														}}
														style={{ marginRight: "1rem" }}
													>
														{processing ? <Loading size={"1.5rem"} color={"text-dark"} /> : "CLOSE ROOM"}
													</button>

													<button
														className="button button-retro is-warning"
														style={{ width: "20%" }}
														onClick={() => {
															resetGame();
														}}
													>
														BACK
													</button>
												</div>

												<Spectators playersInRoom={playersInRoom} urlPrefix={urlPrefix} />
												<span className="text-center rounded" style={{ color: "red", fontSize: "0.8rem" }}>
													If you leave the page, the room will remain active.
												</span>
												<p>
													<span className="text-center rounded" style={{ color: "white", fontSize: "0.8rem" }}>
														To close it, click the button above.
													</span>
												</p>
											</>
										) : (
											<>
												<div className="textinfoyellow font-weight-normal" style={{ fontSize: "1.8rem" }}>
													{destroyer}
												</div>
												<span className="text-center rounded" style={{ color: "white", fontSize: "1rem" }}>
													Room ID: {roomID}
												</span>

												<div className="d-flex my-auto">
													<div className="flip-box mb-2 mx-auto h-full " style={{ width: "50%", marginTop: "15%" }}>
														<div className="d-flex justify-content-center flex-row borderpixelSMALL">
															<div
																className="flip-box-inner d-flex justify-content-center flex-column mx-auto my-auto"
																style={{
																	fontWeight: "500",
																	color: "white",
																	fontSize: "1.45rem",
																	width: "70%",
																}}
															>
																<span className="my-auto">Flip amount: {Math.round(ammoutNEAR * 1000000) / 1000000} Near</span>

																<span
																	className="text-center rounded"
																	style={{
																		color: "white",
																		fontSize: "0.75rem",
																	}}
																>
																	Logged as:{" "}
																	<a href={`${urlPrefix}/${window.accountId}`} target="_blank">
																		{window.accountId.length > 30 ? window.accountId.substring(0, 25) + "…" : window.accountId}
																	</a>
																</span>
																<span
																	className="text-center rounded mt-1"
																	style={{
																		color: "white",
																		fontSize: "0.75rem",
																	}}
																>
																	Playing vs:{" "}
																	{roomCreator ? (
																		<a href={`${urlPrefix}/${window.accountId}`} target="_blank">
																			{roomCreator.length > 30 ? roomCreator.substring(0, 25) + "…" : roomCreator}
																		</a>
																	) : (
																		<Loading size={"1.5rem"} color={"text-dark"} />
																	)}
																</span>
															</div>
														</div>
													</div>
													<div className="flip-box logo mb-2 mx-auto" style={{ width: "40%", marginTop: "12%" }}>
														<div className={sideChoosen === true ? "flip-box-inner my-auto" : "flip-box-inner-flipped my-auto"}>
															<div className="flip-box-front ">
																<img src={LOGOMAIN} alt="logo" width="220" height="220" />
															</div>
															<div className="flip-box-back">
																<img src={LOGOBACK} alt="logoback" width="220" height="220" />
															</div>
														</div>
													</div>
												</div>
												<div className="d-flex my-auto justify-content-between">
													<button
														className="align-self-start button button-retro is-primary"
														disabled={processing}
														onClick={() => {
															setprocessing(true);
															try {
																joinMultiplayer(ammoutNEAR, roomID, roomCreator, socket);
															} catch (err) {
																setprocessing(false);
																console.log(err);
																setErrormsg(err.message);
															}
														}}
														style={{ marginRight: "1rem" }}
													>
														{processing ? <Loading size={"1.5rem"} color={"text-success"} /> : "LET'S FLIP"}
													</button>

													<button
														className="button button-retro is-warning"
														style={{ width: "20%" }}
														onClick={() => {
															resetGame();
														}}
													>
														BACK
													</button>
												</div>
												<Spectators playersInRoom={playersInRoom} urlPrefix={urlPrefix} />
											</>
										)}
									</>
								) : (
									<>
										<h1 className="textsurprese font-weight-normal" style={{ fontSize: "1.5rem" }}>
											{surprisePhrase}
										</h1>
										{window.walletConnection.isSignedIn() ? (
											<>
												<div className="d-flex flex-row-reverse justify-content-center mt-sm-1">
													<button
														className="button button-retro button-retro-small is-success ms-2"
														disabled={processing}
														style={{ letterSpacing: "2px", width: "8rem" }}
														onClick={() => {
															setprocessing(true);

															getRooms()
																.then((data) => {
																	console.log(data);
																	setRooms(data);
																	setprocessing(false);
																})
																.catch((err) => {
																	console.log(err);
																	setprocessing(false);
																});
														}}
													>
														{processing ? <Loading size={"0.8rem"} color={"text-light"} /> : "Refresh"}
													</button>
													<Popup
														trigger={
															<button className="button button-retro button-retro-small is-yellow ms-2" style={{ letterSpacing: "2px", width: "8rem" }}>
																Your Matches
															</button>
														}
														position="center center"
														modal
														contentStyle={contentStyle}
													>
														<SelfMatches
															changeToRoom={(roomId, sidebetstr, nearbetstr) => {
																setSideBet(sidebetstr);
																setBetAmmount(nearbetstr);
																setRoomID(roomId);
																setRoomCreator(window.accountId);
															}}
														/>
													</Popup>
													<Popup
														trigger={
															<button className="button button-retro button-retro-small is-primary ms-2" style={{ letterSpacing: "2px", width: "8rem" }}>
																Create Room
															</button>
														}
														position="center center"
														modal
														contentStyle={contentStyle}
													>
														<CreateRoom />
													</Popup>

													<button
														className="button button-retro button-retro-small is-error ml-1"
														style={{
															letterSpacing: "2px",
															width: "8rem",
															fontSize: "0.7rem",
														}}
														onClick={(event) => {
															//let randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
															// join a random room from room state exclude room's creator
															let randomRoom = rooms.filter((room) => room.creator !== window.accountId)[Math.floor(Math.random() * rooms.length)];

															if (randomRoom === undefined) {
																alert("No room available to play.");
																return;
															}

															const nearBet = convertYocto(randomRoom.entry_price.toLocaleString("fullwide", { useGrouping: false }));
															setRoomID(randomRoom.id);
															setBetAmmount(nearBet);
															setSideBet(randomRoom.face);
															setRoomCreator(randomRoom.creator);

															joinMultiplayer(randomRoom.nearBet, randomRoom.id, window.accountId, socket);
														}}
													>
														Feeling Lucky
													</button>
												</div>
											</>
										) : (
											<></>
										)}

										<div className="maincenter-multi text-center">
											{!window.walletConnection.isSignedIn() ? (
												<>
													<img src={LOGOMAIN} className="logo mx-auto" alt="logo" width="240" height="240" />
												</>
											) : (
												<div className="d-flex flex-column ">
													<div id="game" className="game">
														<h4 className="text-uppercase mt-3 start-mult">Select Player</h4>
													</div>
													<hr className="mt-1" />
													{/* display in a grid system the objects in the rooms array */}
													<Container className="d-flex flex-wrap justify-content-center">
														{processing === true ? (
															<div className="d-flex flex-column justify-items-center text-center">
																<p style={{ fontSize: "2rem" }}>Connecting</p>
																<div className="mx-auto">
																	<Loading size={40} color={"text-light"} />
																</div>
																<button
																	className="button button-retro is-warning bordercool d-inline-block text-center mt-2"
																	style={{
																		overflow: "hidden",
																		fontSize: "1rem",
																		textOverflow: "ellipsis",
																	}}
																	onClick={() => {
																		resetGame();
																	}}
																>
																	<p className="mb-0" style={{ color: "#00000" }}>
																		Refresh
																	</p>
																</button>
															</div>
														) : (
															<>
																{rooms === undefined || rooms.length === 0 ? (
																	<div className="d-flex flex-column">
																		<p>No rooms available.</p>
																		<p>Try to create on for yourself!</p>
																	</div>
																) : (
																	<Row className="justify-content-center align-items-center ">
																		{rooms.map((room, index) => {
																			{
																				/* check if the room creator is greater than 25, if so cut the name to 25 characters */
																			}
																			const p = room.entry_price;
																			// remove testnet from the string
																			let roomCreator = room.creator.replace(".testnet", "");

																			let ammountNEAR = convertYocto(
																				p.toLocaleString("fullwide", {
																					useGrouping: false,
																				})
																			);
																			if (room.creator.length > 18) {
																				roomCreator = roomCreator.substring(0, 17) + "…";
																			}

																			return (
																				<div key={index} className="mt-1 col col-sm-10 col-m-5 col-lg-12 col-xl-12">
																					<button
																						className="button button-retro is-warning bordercool d-inline-block text-center"
																						style={{
																							overflow: "hidden",
																							fontSize: "1rem",
																							textOverflow: "ellipsis",
																						}}
																						onClick={() => joinRoom(room.id, ammountNEAR, room.creator, room.face)}
																					>
																						<span style={roomCreator === window.accountId.replace(".testnet", "") ? { color: "#1b85cc" } : {}}>
																							{roomCreator} #{room.id}
																						</span>
																						<p className="mb-0" style={{ color: "#dd403a" }}>
																							{Math.round(ammountNEAR * 10000000) / 10000000} Near
																						</p>
																					</button>
																				</div>
																			);
																		})}
																	</Row>
																)}
															</>
														)}
													</Container>
												</div>
											)}
										</div>
									</>
								)}
							</>
						) : (
							<div className="mainvs text-center">
								<FlipCoinMultiplayer result={sideResult} quantity={amountWon} loading={false} joinned={window.accountId?.split(".")[0]} creator={roomCreator?.split(".")[0]} width={width} height={height} reset={resetGame} winner={accountWon} />
							</div>
						)}
					</div>
					{!window.walletConnection.isSignedIn() ? <NotLogged /> : <></>}
				</div>
				<FooterComponent />
			</div>
		</>
	);
}
