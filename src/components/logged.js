import React from "react";
import axios from "axios";
import { login, createMultiplayer, getAllPlayerMathces, minimumAmmount, storageRent, storageRentNear } from "../utils.js";
import LOGOBACK from "../assets/nearcoin.svg";
import LOGOMAIN from "../assets/result.svg";
import NearLogo from "../assets/logo-black.svg";
import { feesMultiplayer, convertYocto } from "../utils.js";
import { urlPrefix } from "../App.js";

function generatephrase(ammount, won, account) {
	account = account.split(".")[0];
	const congratulation = [
		"My homie ",
		"My boi ",
		"My friend ",
		"The legend ",
		"The king ",
		"Queen ",
		"The one and only ",
		"He who goes by ",
		"The mysterious ",
		"The one who ",
		"The smartass ",
		"The generous ",
		"The brave ",
		"The mighty ",
		"The great ",
		"The suspicious ",
		"Sir ",
		"Lord ",
		"",
		"",
		"",
		"",
		"",
		"",
		"The wise ",
		"The brave ",
	];
	const ruggedphrases = [
		" didn't need " + ammount + " Near.",
		" donated " + ammount + " Near.",
		" wasted " + ammount + " Near.",
		" lost " + ammount + " Near.",
		" could have saved " + ammount + " Near.",
		" wished that he didn't bet " + ammount + " Near.",
		" sent us " + ammount + " Near. Thanks!",
		" should have donated to charity " + ammount + " Near.",
		" bet " + ammount + " Near and got rugged.",
		" needs " + ammount + " Near. Cause he got rugged.",
		" lost " + ammount + " Near.",
		" should have given " + ammount + " Near to me.",
		" maybe should stop after losing " + ammount + " Near.",
		" got unlucky and lost " + ammount + " Near.",
		" won't get scared of losing " + ammount + " Near.",
		" really likes losing " + ammount + " Near.",
		" is sad cause he lost " + ammount + " Near...",
	];
	const wonphrases = [
		" fought for and won " + ammount + " Near.",
		" bet and won " + ammount + " Near.",
		" sensed the need to win " + ammount + " Near.",
		" won " + ammount + " Near.",
		" finally won " + ammount + " Near.",
		" didn't think much of it and won " + ammount + " Near.",
		" has a new friend and won " + ammount + " Near.",
		" threw a party with " + ammount + " Near.",
		" will share with me " + ammount + " Near.",
		" doubled " + ammount + " Near.",
		" duplicated " + ammount + " Near.",
		" won " + ammount + " Near.",
		" will spent wisely " + ammount + " Near.",
		" called it and won " + ammount + " Near.",
		" likes his new " + ammount + " Near.",
		" got lucky and won " + ammount + " Near.",
		" will give me a ride to dubai with " + ammount + " Near.",
		" is happy cause he won " + ammount + " Near.",
		" will hodl " + ammount + " Near.",
		" is filling up his wallet with " + ammount + " Near.",
		" got " + ammount + " Near.",
	];
	/* returns a random rugged phrase */

	return (
		<>
			{won ? (
				<span style={{ color: "#0cb025" }}>{congratulation[Math.floor(Math.random() * congratulation.length)] + account + wonphrases[Math.floor(Math.random() * wonphrases.length)]}</span>
			) : (
				<span style={{ color: "#E71D36" }}>{congratulation[Math.floor(Math.random() * congratulation.length)] + account + ruggedphrases[Math.floor(Math.random() * ruggedphrases.length)]}</span>
			)}
		</>
	);
}

export function generateDestroyerPhrase(creator) {
	if (creator && creator.length > 18) {
		creator = creator.split(".")[0];
	}

	const phrase = [
		"Destroy this idiot",
		creator + "'s Room",
		creator + "'s Room",
		creator + "'s Room",
		creator + "'s Room",
		creator + "'s Room",
		"Kick some ass",
		"This Room will be Heads",
		"Best of 3?",
		"What a kind donation :)",
		"Prepare to be rekt",
		"Easy 2x lmao",
		"Ⓝ I CAN SMELL IT Ⓝ",
		"LET'S DO THIS",
		"Rugging People On Chain Lmao...",
	];
	return phrase[Math.floor(Math.random() * phrase.length)];
}

export function SelfMatches(props) {
	const [matches, setMatches] = React.useState([]);

	React.useEffect(() => {
		getAllPlayerMathces(window.accountId)
			.then((res) => {
				setMatches(res);
				console.log(res);
			})
			.catch((err) => {
				setError(true);
			});
	}, []);

	return (
		<div className="form-signin2 mx-auto rounded-2 d-flex flex-column borderpixelYRM w-full">
			<span className="text-center rounded" style={{ fontWeight: "800", color: "white", fontSize: "1.6rem" }}>
				Your Currently Open Matches as:{" "}
				<a href={`${urlPrefix}/${window.accountId}`} target="_blank">
					{window.accountId}
				</a>
			</span>
			<div className="justify-center mt-3 h-full w-full">
				{matches ? (
					<>
						{matches.length > 0 ? (
							<div className="flip-box mb-2 mt-2 text-center h-full align-middle justify-center mx-2" style={{ width: "100%", overflowY: "scroll" }}>
								{matches.map((match, index) => {
									return (
										<div className="d-flex text-center flex-column mt-2 align-middle justify-center px-4">
											<button
												className="button-retro button-retro-small is-yellow align-middle justify-center"
												style={{ letterSpacing: "2px", width: "100%" }}
												onClick={() => {
													//convert to near
													const ammount = convertYocto(match.entry_price.toLocaleString("fullwide", { useGrouping: false }));
													props.changeToRoom(match.id, match.face, ammount);
												}}
											>
												<span className="text-center" style={{ fontWeight: "800", color: "white", fontSize: "0.8rem" }}>
													#{match.id} - {match.face === "true" ? "Heads" : "Tails"}: {Math.round(convertYocto(match.entry_price.toLocaleString("fullwide", { useGrouping: false })) * 10000000) / 10000000} Near
												</span>
											</button>
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center align-middle font-normal" style={{ fontSize: "1.5rem" }}>
								No Matches Found
							</div>
						)}
					</>
				) : (
					<Loading />
				)}
			</div>
		</div>
	);
}

export function CreateRoom() {
	const [tailsHeads, setTailsHeads] = React.useState(Math.random() < 0.5 ? "tails" : "heads");
	const [buttonDisabled, setButtonDisabled] = React.useState(false);
	const [processing, setprocessing] = React.useState(false);
	const [ammoutNEAR, setAmmountNEAR] = React.useState(0);
	const [inputbox, setInputbox] = React.useState("");

	const toggleHeadsTails = () => {
		if (tailsHeads === "heads") {
			setTailsHeads("tails");
		} else {
			setTailsHeads("heads");
		}
	};

	function handleChange(event) {
		// check if event.target.value has "e" character
		if (event.target.value.includes("e")) {
			setButtonDisabled(true);
			return;
		}

		let text = event.target.value;
		if (text.length < 7) {
			setInputbox(event.target.value);

			if (text.length > 0) {
				//parse text to int
				let ammount = parseFloat(text);
				if (ammount >= minimumAmmount) {
					setButtonDisabled(false);
					setAmmountNEAR(ammount);
					return;
				} else {
					setButtonDisabled(true);
				}
			}
			setButtonDisabled(true);
		}
	}

	const createMatch = async (tailsHeads) => {
		setprocessing(true);
		setButtonDisabled(true);
		createMultiplayer(ammoutNEAR, tailsHeads);
	};

	return (
		<div className="form-signin2 mx-auto rounded-2 d-flex flex-column borderpixelCR w-full">
			<span className="text-center rounded" style={{ fontWeight: "800", color: "white", fontSize: "1.6rem" }}>
				Create Room
			</span>
			<span className="text-center mb-3 rounded" style={{ fontWeight: "500", color: "white" }}>
				Flipping as: {window.accountId}
			</span>
			<div className="d-flex">
				<div className="flip-box mb-2 mx-auto h-full" style={{ width: "55%" }}>
					<div className="flip-box-inner d-flex justify-content-center flex-column mx-auto" style={{ fontWeight: "500", color: "white", fontSize: "1.45rem", width: "70%" }}>
						<span className="mb-4">Flip amount:</span>
						<div className="d-flex justify-content-center flex-row borderpixelSMALL">
							<input className="box" type="number" placeholder={ammoutNEAR.toString()} value={inputbox} onChange={handleChange} />
							<span className="m-auto p-2" style={{ fontSize: "1.2rem" }}>
								Near
							</span>
						</div>
						<span className="text-danger text-center pt-3" style={{ fontSize: "0.75rem" }}>
							{ammoutNEAR > 0 ? Math.round((ammoutNEAR * feesMultiplayer + storageRentNear) * 10000000) / 10000000 : 0} Near after Fees.
						</span>
					</div>
				</div>
				<div className="flip-box logo mb-2 mx-auto" style={{ width: "40%" }}>
					<div className={tailsHeads === "heads" ? "flip-box-inner my-auto" : "flip-box-inner-flipped my-auto"}>
						<div className="flip-box-front ">
							<img
								src={LOGOMAIN}
								alt="logo"
								width="220"
								height="220"
								onClick={() => {
									toggleHeadsTails();
								}}
							/>
						</div>
						<div className="flip-box-back">
							<img
								src={LOGOBACK}
								alt="logoback"
								width="220"
								height="220"
								onClick={() => {
									toggleHeadsTails();
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			<button
				className="button button-retro is-warning mt-3"
				onClick={(event) => {
					console.log(tailsHeads);
					console.log(ammoutNEAR);

					createMatch(tailsHeads);
				}}
				disabled={buttonDisabled || tailsHeads === "" || ammoutNEAR === 0}
			>
				{processing ? <Loading size={"1.5rem"} color={"text-warning"} /> : "Flip!"}
			</button>
			<span className="text-warning text-center mt-2" style={{ fontSize: "0.75rem" }}>
				Fees = Room Storage Rent + NFTs distribution fee
			</span>
		</div>
	);
}

export function TopPlays() {
	const [plays, setPlays] = React.useState([]);
	const [errormsg, setErrormsg] = React.useState("");

	React.useEffect(() => {
		axios
			.get(process.env.DATABASE_URL + "/plays/top")
			.then((res) => {
				setPlays(res.data.plays);
			})
			.catch((error) => {
				console.error(error);
				setErrormsg("Error loading top plays");
			});
	}, []);

	return (
		<div className="form-signin2 text-start mx-auto rounded-2 borderpixelf" style={{ backgroundColor: "#DD403A" }}>
			<h4 className="text-center p-1 rounded" style={{ fontWeight: "800", color: "white" }}>
				🔥 On Fire 🔥
			</h4>
			{plays === undefined || plays.length === 0 ? (
				<div style={{ marginLeft: "50%" }}>
					<Loading size={25} color={"text-light"} />
				</div>
			) : errormsg !== "" ? (
				<div className="textsurprese font-weight-normal" style={{ fontSize: "1.2rem" }}>
					{" "}
					Error fetching plays :/{" "}
				</div>
			) : (
				<ul className="list-group">
					{plays.map((play, i) => {
						console.log(play);
						const env = play._id.split(".")[1] === "testnet" ? "testnet" : "mainnet";
						const url = `https://explorer.${env}.near.org/accounts/` + play._id;
						return (
							<a href={url} key={i} className="text-decoration-none" target="_blank">
								<li className="list-group-item d-flex cursor-pointer rounded-2">
									<div className="profile-picture">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <></>}</div>
									<div className="title mt-1" style={{ fontSize: "0.73rem" }}>
										<span>
											{play._id} with the streak: {play.streak}
										</span>
									</div>
									<small className="ms-auto mt-auto time-in-row" style={{ fontSize: "0.68rem", fontWeight: "lighter" }}>
										Last Played: {get_time_diff(play.date)}
									</small>
								</li>
							</a>
						);
					})}
				</ul>
			)}
		</div>
	);
}

export function RecentPlays() {
	const [plays, setPlays] = React.useState([]);
	const [errormsg, setErrormsg] = React.useState("");

	React.useEffect(() => {
		console.log(process.env.DATABASE_URL + "/plays");
		axios
			.get(process.env.DATABASE_URL + "/plays")
			.then((res) => {
				setPlays(res.data.plays);
			})
			.catch((error) => {
				setErrormsg("Couldn't get the latest plays :(");
				console.error("Error fetching Plays: ", error);
			});
	}, []);
	//🔥 Fire 🔥
	return (
		<div className="form-signin2 text-start mx-auto rounded-2 borderpixelP" style={{ backgroundColor: "#829922" }}>
			<h4 className="text-center p-1 rounded" style={{ fontWeight: "800", color: "white" }}>
				🎮 Who's Playin? 🎮
			</h4>

			{plays === undefined || plays.length === 0 ? (
				<div style={{ marginLeft: "50%" }}>
					<Loading size={25} color={"text-light"} />
				</div>
			) : errormsg !== "" ? (
				<div className="textsurprese font-weight-normal" style={{ fontSize: "1.2rem" }}>
					{" "}
					Error fetching players :/{" "}
				</div>
			) : (
				<ul className="list-group">
					{plays.map((play, i) => {
						console.log(play);
						const env = play.walletaccount.split(".")[1] === "testnet" ? "testnet" : "mainnet";
						const url = `https://explorer.${env}.near.org/accounts/` + play.walletaccount;
						return (
							<a href={url} key={i} className="text-decoration-none" target="_blank">
								<li className="list-group-item d-flex cursor-pointer rounded-2">
									<div className="profile-picture">
										<img src={NearLogo} height={30} width={30} alt="logoback" />
									</div>
									<div className="title mt-1" style={{ fontSize: "0.73rem" }}>
										{play.ammount >= 10 ? <span style={{ fontWeight: "500" }}>{generatephrase(play.ammount, play.won, play.walletaccount)}</span> : <span>{generatephrase(play.ammount, play.won, play.walletaccount)}</span>}
									</div>
									<small className="ms-auto mt-auto urltrx" style={{ fontSize: "0.42rem", color: "grey", fontWeight: "lighter" }}>
										Transaction: {play.tx}
									</small>
									<small className="ms-auto mt-auto time-in-row" style={{ fontSize: "0.68rem", fontWeight: "lighter" }}>
										{get_time_diff(play.date)}
									</small>
								</li>
							</a>
						);
					})}
				</ul>
			)}
		</div>
	);
}

export function TopPlayers() {
	const [players, setPlayers] = React.useState([]);
	const [errormsg, setErrormsg] = React.useState("");

	React.useEffect(() => {
		axios
			.get(process.env.DATABASE_URL + "/plays/best")
			.then((res) => {
				setPlayers(res.data.plays);
			})
			.catch((error) => {
				setErrormsg("Couldn't get the best players :(");
				console.error("Error fetching Plays: ", error);
			});
	}, []);
	//money emoji: 💰
	//money fly emoji: 💸
	//bank emoji: 💵
	//play emoji: 🎮

	return (
		<div className="form-signin2 text-start mx-auto rounded-2 borderpixelm" style={{ backgroundColor: "#33b5e5" }}>
			<h4 className="text-center p-1 rounded" style={{ fontWeight: "800", color: "white" }}>
				💵 MVPs 💵
			</h4>
			{players === undefined || players.length === 0 ? (
				<div style={{ marginLeft: "50%" }}>
					<Loading size={25} color={"text-light"} />
				</div>
			) : errormsg !== "" ? (
				<div className="textsurprese font-weight-normal" style={{ fontSize: "1.2rem" }}>
					{" "}
					Error fetching players :/{" "}
				</div>
			) : (
				<ul className="list-group">
					{players.map((play, i) => {
						const env = play._id.split(".")[1] === "testnet" ? "testnet" : "mainnet";
						const url = `https://explorer.${env}.near.org/accounts/` + play._id;
						return (
							<a href={url} key={i} className="text-decoration-none" target="_blank">
								<li className="list-group-item d-flex cursor-pointer rounded-2">
									<div className="profile-picture">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <></>}</div>
									<div className="title mt-1 ms-1" style={{ fontSize: "0.73rem" }}>
										<span>
											{play._id} won a total ammount of {play.totalammountwon} Near!
										</span>
									</div>
									<small className="ms-auto mt-auto time-in-row" style={{ fontSize: "0.68rem", fontWeight: "lighter" }}>
										Last Played: {get_time_diff(play.date)}
									</small>
								</li>
							</a>
						);
					})}
				</ul>
			)}
		</div>
	);
}

export function NotLogged() {
	return (
		<>
			<div className="mt-5 mb-3">
				<button className="wallet-adapter-button justify-content-center mx-auto btnhover" onClick={login}>
					LOG IN NEAR
					<img src={NearLogo} alt="Near Logo" className="nearlogo mb-1" style={{ width: "40px", height: "40px" }} />
				</button>
			</div>
			<div className="accordion text-center mb-2" id="myAccordion">
				<h6 className="mt-3 mx-auto" style={{ transition: "color 0.4 ease-in-out", width: "100%" }}>
					<small style={{ fontSize: "0.8rem", letterSpacing: "0.005rem" }}>
						<a href="#">wtf is this shit</a> | <a href="#">bro i have a question.</a> | <a href="#">Tutorial pls</a> | <a href="#">TestNet Demo</a> | <a href="#">Am I dumb?</a>
					</small>
				</h6>
			</div>
		</>
	);
}

export function Loading(props) {
	return (
		<div className={props.color === undefined ? "spinner-border text-warning" : "spinner-border " + props.color} role="status" style={{ width: props.size, height: props.size }}>
			<span className="sr-only"></span>
		</div>
	);
}

function get_time_diff(datetime) {
	var date1 = new Date(datetime);
	var date2 = new Date();
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());

	var days = Math.floor(timeDiff / 86400000); // days
	var hours = Math.floor((timeDiff % 86400000) / 3600000); // hours
	var minutes = Math.round(((timeDiff % 86400000) % 3600000) / 60000); // minutes
	var seconds = Math.round((((timeDiff % 86400000) % 3600000) % 60000) / 1000); // seconds
	/* for some reason I think this condition is trash, but im to tired to even think about it so fuck it, yeah!? */
	if (days === 0) {
		if (hours === 0) {
			if (minutes === 0) {
				if (seconds === 0) {
					return "just now";
				} else if (seconds === 1) {
					return seconds + " second ago";
				}
				return seconds + " seconds ago";
			} else if (minutes === 1) {
				return minutes + " minute ago";
			}
			return minutes + " Minutes ";
		} else if (hours === 1) {
			return hours + " Hour " + minutes + " Minutes ";
		}
		return hours + " hours ago";
	} else if (days === 1) {
		return days + " day ago";
	} else {
		return days + " days ago";
	}
}

document.querySelectorAll(".logo").forEach((button) => {
	const bounding = button.getBoundingClientRect();

	button.addEventListener("mousemove", (e) => {
		let dy = (e.clientY - bounding.top - bounding.height / 2) / -1;
		let dx = (e.clientX - bounding.left - bounding.width / 2) / 10;

		dy = dy > 10 ? 10 : dy < -10 ? -10 : dy;
		dx = dx > 4 ? 4 : dx < -4 ? -4 : dx;

		button.style.setProperty("--rx", dy);
		button.style.setProperty("--ry", dx);
	});

	button.addEventListener("mouseleave", (e) => {
		button.style.setProperty("--rx", 0);
		button.style.setProperty("--ry", 0);
	});

	button.addEventListener("click", (e) => {
		button.classList.add("success");
		gsap.to(button, {
			"--icon-x": -3,
			"--icon-y": 3,
			"--z-before": 0,
			duration: 0.2,
			onComplete() {
				particles(button.querySelector(".emitter"), 100, -4, 6, -80, -50);
				gsap.to(button, {
					"--icon-x": 0,
					"--icon-y": 0,
					"--z-before": -6,
					duration: 1,
					ease: "elastic.out(1, .5)",
					onComplete() {
						button.classList.remove("success");
					},
				});
			},
		});
	});
});
