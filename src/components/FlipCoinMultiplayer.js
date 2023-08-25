import React from "react";
import Confetti from "react-confetti";
import logoH from "../assets/coinreal.mp4";
import { menusayingloseMulti, menusayingswinMulti } from "../utils";
import { Loading } from "./logged";

function FlipCoinMultiplayer(props) {
	const [processing, setprocessing] = React.useState(true);
	const [winPhrase, setwinPhrase] = React.useState(menusayingswinMulti[Math.floor(Math.random() * menusayingswinMulti.length)]);
	const [losePhrase, setlosePhrase] = React.useState(menusayingloseMulti[Math.floor(Math.random() * menusayingloseMulti.length)]);

	React.useEffect(() => {
		setTimeout(function () {
			setprocessing(false);
		}, 7000);
	}, []);

	const res = () => {
		props.reset();
	};

	return (
		<>
			<div id="cointainerMult" className="">
				<video autoPlay muted playsInline className="video-container d-flex justify-content-center flex-row borderpixelSMALL" style={{ marginTop: "2rem" }}>
					<source src={props.result === "heads" ? logoH : logoH} type="video/mp4" />
				</video>
			</div>
			<div className="d-flex justify-center align-middle w-100">
				<span className="font-weight-bold outlineyellowvsSMALL  w-50 animateDown">{props.creator}</span>
				<span className="font-weight-bold outlineyellowvs w-full mx-2 animateUpDown">VS</span>
				<span className="font-weight-bold outlineyellowvsSMALL w-50 animateUp">{props.joinned}</span>
			</div>
			<div className={processing === false ? "fadein" : "fadein fadeout"}>
				{props.winner === window.accountId ? (
					<>
						<Confetti width={props.width - 1} height={props.height - 1} />
						<div className="font-weight-normal" style={{ fontSize: "1.8rem" }}>
							YOU WON
						</div>
						<span className="textinfowinnoanim font-weight-normal" style={{ fontSize: "2rem" }}>
							{Math.round(props.quantity * 1000000) / 1000000} NEAR
						</span>
						<hr className="mb-3" />
						<div style={{ fontSize: "1.3rem", textTransform: "uppercase", fontStyle: "italic" }} className={"mt-2 wavy"}>
							{/* for each letter in winPhrase create a span with it */}
							{winPhrase.split("").map((letter, index) => {
								let styles = { "--i": index };
								if (letter === " ") {
									styles = { "--i": index, width: "0.7rem" };
								}
								return (
									<span key={index} style={styles}>
										{letter}
									</span>
								);
							})}
						</div>
						<button className="button button-retro is-primary my-2" onClick={res}>
							{processing ? <Loading size={"1.5rem"} color={"text-success"} /> : "Play Again"}
						</button>
					</>
				) : (
					<>
						<div className="font-weight-normal" style={{ fontSize: "1.8rem" }}>
							You Lost.
						</div>
						<span className="textinfolosenoanim font-weight-normal" style={{ fontSize: "2rem" }}>
							{Math.round(props.quantity * 1000000) / 1000000} NEAR
						</span>
						<hr className="mb-3" />
						<div style={{ fontSize: "1.3rem", textTransform: "uppercase", fontStyle: "italic" }} className={"mt-2 wavy"}>
							{losePhrase.split("").map((letter, index) => {
								let styles = { "--i": index };
								if (letter === " ") {
									styles = { "--i": index, width: "0.7rem" };
								}
								return (
									<span key={index} style={styles}>
										{letter}
									</span>
								);
							})}
						</div>
						<button className="button button-retro is-primary my-2" onClick={res}>
							{processing ? <Loading size={"1.5rem"} color={"text-warning"} /> : "Play Again"}
						</button>
					</>
				)}
			</div>
		</>
	);
}

export default FlipCoinMultiplayer;
