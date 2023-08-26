import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Popup from "reactjs-popup";
import { useLocation } from "react-router-dom";

import { RecentPlays, TopPlays, TopPlayers, Loading } from "./logged";
import { urlPrefix } from "../App";
import { logout, convertYocto } from "../utils";

const contentStyle = {
	maxWidth: "660px",
	width: "90%",
};
const HeaderButtons = ({ balance }) => {
	//popup
	const [show, setShow] = React.useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const location = useLocation();

	return (
		<header className="social-icons">
			<div className="d-flex flex-sm-column justify-content-start align-items-center h-100 mt-auto">
				<div className="mt-3 d-flex flex-column shortcut-row">
					<div className="d-flex flex-sm-row ustify-content-center flex-column mb-2 toolbar mx-auto">
						<div className="d-flex flex-row">
							<div role="button" className="retro-btn warning">
								<div role="button" className="retro-btn warning" style={{ display: !window.walletConnection.isSignedIn() ? "none" : "" }}>
									<Link to={location.pathname === "/" ? "/play" : "/"} id="RouterNavLink">
										<div className="buttoncool">
											<span className="btn-inner">
												<span className="content-wrapper">
													<span className="btn-content">
														<span className="btn-content-inner" label="Change Mode"></span>
													</span>
												</span>
											</span>
										</div>
									</Link>
								</div>
							</div>
							<Popup
								trigger={
									<div role="button" className="retro-btn danger">
										<a className="buttoncool">
											<span className="btn-inner">
												<span className="content-wrapper">
													<span className="btn-content">
														<span className="btn-content-inner" label="ON FIRE"></span>
													</span>
												</span>
											</span>
										</a>
									</div>
								}
								position="center center"
								modal
								contentStyle={contentStyle}
							>
								<TopPlays />
							</Popup>
						</div>
						<div className="d-flex flex-row">
							<Popup
								trigger={
									<div role="button" className="retro-btn">
										<a className="buttoncool">
											<span className="btn-inner">
												<span className="content-wrapper">
													<span className="btn-content">
														<span className="btn-content-inner" label="WHO'S PLAYIN"></span>
													</span>
												</span>
											</span>
										</a>
									</div>
								}
								position="center center"
								modal
								contentStyle={contentStyle}
							>
								<RecentPlays />
							</Popup>

							<Popup
								trigger={
									<div role="button" className="retro-btn info">
										<a className="buttoncool">
											<span className="btn-inner">
												<span className="content-wrapper">
													<span className="btn-content">
														<span className="btn-content-inner" label="TOP PLAYERS"></span>
													</span>
												</span>
											</span>
										</a>
									</div>
								}
								position="center center"
								modal
								contentStyle={contentStyle}
							>
								<TopPlayers />
							</Popup>
						</div>

						{!window.walletConnection.isSignedIn() ? (
							<></>
						) : (
							<>
								<div className="profile-picture-md">
									<img className="image rounded-circle cursor-pointer border-2" src="https://i.imgur.com/E3aJ7TP.jpg" alt="" onClick={handleShow} />
								</div>
								<Modal show={show} onHide={handleClose} aria-labelledby="contained-modal-title-vcenter" centered>
									<div className="borderpixelPR">
										<Modal.Body className="p-0 " style={{ color: "black" }}>
											<div className="d-flex flex-column ">
												<div className="card-body text-center">
													<h4 style={{ fontWeight: "bold" }}>USER PROFILE</h4>
													<h6>
														<small style={{ fontWeight: "semibold" }} className="w-30">
															Currently logged as:
															<a href={`${urlPrefix}/${window.accountId}`} target="_blank">
																{window.accountId.length > 30 ? window.accountId.substring(0, 25) + "…" : window.accountId}
															</a>
															!
														</small>
													</h6>
													<h6>First Fliperino: WIP</h6>
													<div className="input-group">
														{/*<input type="text" className="form-control" placeholder="Nickname" aria-label="Username" aria-describedby="basic-addon1" value=""/>
														 */}
													</div>
												</div>
												<div className="d-flex  flex-column justify-content-center bg-light linetop" style={{ margin: "0px" }}>
													<button className="btn w-80 mt-2 ms-3 me-3 rounded-2 btn-danger mb-3 " onClick={logout} style={{ fontWeight: "semibold", fontSize: "1.1rem" }}>
														Disconnect Wallet
													</button>
												</div>
											</div>
										</Modal.Body>
									</div>
								</Modal>
							</>
						)}
					</div>
					{window.walletConnection.isSignedIn() && (
						<div className="d-flex flex-column">
							<h6 className="mt-1 w-30" style={{ textAlign: "end" }}>
								Currently logged as:
								<a href={`${urlPrefix}/${window.accountId}`} target="_blank">
									{window.accountId.length > 20 ? window.accountId.substring(0, 20) + "…" : window.accountId}
								</a>
								!
							</h6>
							<h6 className="balance-text mb-0">{balance === "" ? <Loading /> : balance}</h6>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default HeaderButtons;
