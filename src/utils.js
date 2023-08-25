import { connect, Contract, keyStores, WalletConnection, utils, providers } from "near-api-js";
import getConfig from "./config";
import axios from "axios";

const node_env = "mainnet";
const nearConfig = getConfig("mainnet");

let reconnectTimeout = null;
let providerurl = "https://archival-rpc." + node_env + ".near.org";
//console.log(providerurl)
//network config (replace testnet with mainnet or betanet)
const provider = new providers.JsonRpcProvider(providerurl);

let near;
export const fees = 1.035;
export const feesMultiplayer = 1.0175;
export const minimumAmmount = 0.01;
export const storageRent = 640000000000000000000;
export const storageRentNear = 0.00064;

export const menusayingsmult = [
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Near Flip Multiplayer!",
	"Ready to rekt some noobs",
	"Mom get the camera",
	"1v1 me",
	"lmao ez clap",
	"360 no flip collat",
	"Pro flipper here",
	"PENTAFLIP",
	"rush heads",
	"rush tails",
	"Carry me through the next flip pls",
	"Stop smurfing pls",
	"Play vs real players",
	"Flippin together",
	"gg heads diff",
	"gg tails diff",
	"+20 flip mmr",
];

export const menusayings = [
	"Near Coin Flip!",
	"Want to play a game?",
	"Prepare to be flipped!",
	"Flip a coin!",
	"GIVE ME MY NEAR BACK!",
	"I'm a coin-flipping machine!",
	"*rawr*",
	"shhhhh, its tails bro trust me.",
	"fifty-fifty.",
	"It's Heads.\nSource: Trust me bro.",
	"Do you even Flip?",
	"Make a wish...",
	"The Legend of PS,\nThe God of the Flips.",
	"Might wanna double it...",
	"I'll phone a friend.",
	"Let me take a breath.",
	"What color do I want my lambo....",
	"See you in Dubai",
	"Fliperino the coinerino",
	"Poggers",
	"Flippin in the moon",
	"one sec, let me call drake brb",
];

export const menusayingslose = [
	"Better luck next time..",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Shit Game.",
	"Lmao Get Rugged.",
	"Lmao Get Rugged.",
	"Lmao Get Rugged.",
	"Lmao Get Rugged.",
	"*sadge*",
];

export const menusayingswin = [
	"You won!",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"You got lucky!",
	"lmao ez clap",
	"You're a winner!",
	"2x just like that.",
	"You're a winner!",
	"LET'S DRINKS ON ME",
	"ME WON NEAR, ME IS WINNER",
	"Just like that ;)",
	"SOLID.",
	"LET'S GOOOOOOOOOOO",
	"yo drake, can i come over?",
	"brb https://www.yachtworld.co.uk/",
	"WOOOOOOO",
	"BOOK BOOK BOOK",
	"Is that easy?",
	"lmao ez clap",
	"You're a winner!",
	"2x just like that.",
	"Easy Peasy Lemon Squeezy",
	"SOLID.",
	"I'm the best coin-flipping machine!",
];

export const menusayingswinMulti = [
	"You won!",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"BO3 Idiot?",
	"Some kids never learn...",
	"Try again?",
	"brb https://www.yachtworld.co.uk/", //link
	"WOOOOOOO",
	"BOOK BOOK BOOK",
	"Is that easy?",
	"lmao ez clap",
	"You're a winner!",
	"2x just like that.",
	"Easy Peasy Lemon Squeezy",
	"SOLID.",
	"Dude you are sooo baddddd",
	"Diamond Flipper since '93",
	"You just got flipped bro",
	"i feel so sad about u man...",
	"coool greeeeeeen",
	"yay!",
	"LET'S FUCKING GOOOOO",
	"Solid.",
	"ez clap",
	"Get out of my level.",
];

export const menusayingloseMulti = [
	"Better luck next time...",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Try again?",
	"Shit Game.",
	"Lmao Get Rugged.",
	"Lmao Get Rugged.",
	"Lmao Get Rugged.",
	"Lmao Get Rugged.",
	"*sadge*",
	"Bro i just got flipped",
	"BO3?",
	"fuck you",
	"dude can you give me a refund?",
	":( not funny man",
	"fuckin nerd",
	"shit",
	"FUCK.",
];

export const contractID = process.env.CONTRACT_NAME_MULT || "multiplayer.flipnear.a3corp.testnet";
const contractIDSingle = process.env.CONTRACT_NAME_SINGLEPLAYER || "dev-1645893673006-39236998475304";

export function genrandomphrase() {
	return menusayingsmult[Math.floor(Math.random() * menusayingsmult.length)];
}

// Initialize contract & set global variables
export async function initContract() {
	// Initialize connection to the NEAR testnet
	near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig));

	// Initializing Wallet based Account. It can work with NEAR testnet wallet that
	// is hosted at https://wallet.testnet.near.org
	window.walletConnection = new WalletConnection(near);

	// Getting the Account ID. If still unauthorized, it's just empty string
	window.accountId = window.walletConnection.getAccountId();

	// Initializing our contract APIs by contract name and configuration
	window.contractMULT = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
		// View methods are read only. They don't modify the state, but usually return some value.
		viewMethods: ["view_all_matches", "join_match", "view_match_from"],
		// Change methods can modify the state. But you don't receive the returned value when called.
		changeMethods: ["create_match", "cancel_match"],
		// Sender is the account ID to initialize transactions. It can be omitted if you want to send
		sender: window.walletConnection.account(), // account object to initialize and sign transactions.
	});

	// Initializing our contract APIs by contract name and configuration
	window.contractSINGLE = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
		// View methods are read only. They don't modify the state, but usually return some value.
		viewMethods: ["coin_flip"],
		// Change methods can modify the state. But you don't receive the returned value when called.
		changeMethods: [],
		// Sender is the account ID to initialize transactions. It can be omitted if you want to send
		sender: window.walletConnection.account(), // account object to initialize and sign transactions.
	});
}

export function sendpostwithplay(txHash) {
	axios
		.post(process.env.DATABASE_URL + "/plays", {
			txhash: txHash,
			accountid: window.accountId,
		})
		.then((res) => {
			console.log(res);
		})
		.catch((e) => {
			console.log("Error Storing flip :((( Don't worry, you still recieve your NEAR!");
			console.error(e);
		});
}

export async function getRooms() {
	let rooms = await window.contractMULT.view_all_matches();
	return rooms;
}

export function convertYocto(YOCTO) {
	return utils.format.formatNearAmount(YOCTO);
}

export async function gettxsRes(txs) {
	const result = await provider.txStatus(txs, window.accountId);
	return result;
}

export function logout() {
	window.walletConnection.signOut();
	// reload page
	window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
	// Allow the current app to make calls to the specified contract on the
	// user's behalf.
	// This works by creating a new access key for the user's account and storing
	// the private key in localStorage.

	window.walletConnection.requestSignIn(nearConfig.contractName);
}

export async function getRoomInfoFromTxs(txs) {
	const result = await provider.txStatus(txs, window.accountId);
	return result;
}

export async function getState(txHash, accountId) {
	const result = await provider.txStatus(txHash, accountId);
	console.log("Result: ", result);
}

export function flip(args, ammoutNEAR) {
	let total = ammoutNEAR * fees;
	//round with 4 decimal places
	total = Math.round(total * 10000) / 10000;
	let yoctoNEAR = utils.format.parseNearAmount(total.toString());

	window.walletConnection
		.account()
		.functionCall({
			contractId: contractIDSingle.toString(),
			methodName: "coin_flip",
			args: { option: args },
			gas: "20000000000000",
			attachedDeposit: yoctoNEAR,
		})
		.catch((e) => {
			console.log("Could not flip :(", e);
		});
}

export async function getAllPlayerMathces(accountId) {
	const res = await window.contractMULT.view_match_from({ creator: accountId });
	return res ? res : [];
}

export function joinMultiplayer(ammoutNEAR, idroom, roomCreator, socket) {
	// convert to normal number from cientific notation
	let yoctoNEAR = Number(utils.format.parseNearAmount((ammoutNEAR * feesMultiplayer).toString()));
	yoctoNEAR = yoctoNEAR.toLocaleString("fullwide", { useGrouping: false });
	console.log("yoctoNEAR: ", yoctoNEAR);
	console.log("idroom: ", idroom);
	console.log("roomCreator: ", roomCreator);

	window.walletConnection
		.account()
		.functionCall({
			contractId: contractID.toString(),
			methodName: "join_match",
			args: { id: idroom, creator: roomCreator },
			gas: "50000000000000",
			attachedDeposit: yoctoNEAR,
		})
		.then((res) => {
			console.log("Joined Match!");
			socket.emit("updateRooms");
		})
		.catch((e) => {
			console.log("Error Joining Match :(");
			console.error(e);
		});
}

export function createMultiplayer(ammoutNEAR, tailsHeads, socket) {
	let argside = tailsHeads === "heads";
	let totalammount = ammoutNEAR * feesMultiplayer;
	let yoctoNEAR = (Number(utils.format.parseNearAmount(totalammount.toString())) + storageRent).toLocaleString("fullwide", { useGrouping: false });

	console.log("yoctoNEAR: ", yoctoNEAR);
	console.log("ammoutNEAR: ", ammoutNEAR);
	console.log("argside: ", argside);

	window.walletConnection
		.account()
		.functionCall({
			contractId: contractID.toString(),
			methodName: "create_match",
			args: { face: argside, rent_amount: storageRent.toString() },
			gas: "20000000000000",
			attachedDeposit: yoctoNEAR,
		})
		.then((res) => {
			console.log("Created Match!");
			console.log(res);
			// we don't emit updaterooms bc there's no
			// socket connection in the near approve screen.
		})
		.catch((e) => {
			console.log("Error Creating Match :(");
			console.error(e);
		});
}

export async function closeRoom(roomId, setprocessing, setShowNotification, resetGame, setErrormsg, socket) {
	setprocessing(true);
	window.walletConnection
		.account()
		.functionCall({
			contractId: contractID.toString(),
			methodName: "cancel_match",
			args: { id: roomId },
			gas: "20000000000000",
		})
		.then((res) => {
			console.log("cancelled Match!");
			console.log(res);

			// emit roomUpdates
			console.log("Emitting updateRooms");
			socket.emit("updateRooms");

			const ascii = Buffer.from(res.status.SuccessValue, "base64").toString("ascii");
			if (ascii === "true") {
				setShowNotification(true);
				resetGame();
			} else {
				setErrormsg("Error while canceling the match");
			}

			setprocessing(false);
		})
		.catch((err) => {
			console.log(err);
			setprocessing(false);
			setShowNotification(true);
		});
}

export function listenToRooms(socket, processRooms) {
	const scheduleReconnect = (timeOut) => {
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		reconnectTimeout = setTimeout(() => {
			console.log("Reconnecting to rooms");
			listenToRooms(socket, processRooms);
		}, timeOut);
	};

	if (document.hidden) {
		scheduleReconnect(1000);
		return;
	}

	socket.on("connect", () => {
		console.log("Connected to socket");
	});

	socket.on("rooms", (data) => {
		console.log("socket All Rooms: ", data);
		processRooms(data);
	});

	socket.on("disconnect", () => {
		console.log("Disconnected from socket");
	});
}

export function startup() {
	document.querySelectorAll(".wallet-adapter-button").forEach((button) => {
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

	const tipButtons = document.querySelectorAll(".tip-button");

	// Loop through all buttons (allows for multiple buttons on page)
	tipButtons.forEach((button) => {
		let coin = button.querySelector(".coin");

		// The larger the number, the slower the animation
		coin.maxMoveLoopCount = 90;

		button.addEventListener("click", () => {
			if (button.clicked) return;

			button.classList.add("clicked");

			// Wait to start flipping the coin because of the button tilt animation
			setTimeout(() => {
				// Randomize the flipping speeds just for fun
				coin.sideRotationCount = Math.floor(Math.random() * 5) * 90;
				coin.maxFlipAngle = (Math.floor(Math.random() * 4) + 3) * Math.PI;
				button.clicked = true;
				flipCoin();
			}, 50);
		});

		const flipCoin = () => {
			coin.moveLoopCount = 0;
			flipCoinLoop();
		};

		const resetCoin = () => {
			coin.style.setProperty("--coin-x-multiplier", 0);
			coin.style.setProperty("--coin-scale-multiplier", 0);
			coin.style.setProperty("--coin-rotation-multiplier", 0);
			coin.style.setProperty("--shine-opacity-multiplier", 0.4);
			coin.style.setProperty("--shine-bg-multiplier", "50%");
			coin.style.setProperty("opacity", 1);
			// Delay to give the reset animation some time before you can click again
			setTimeout(() => {
				button.clicked = false;
			}, 300);
		};

		const flipCoinLoop = () => {
			coin.moveLoopCount++;
			let percentageCompleted = coin.moveLoopCount / coin.maxMoveLoopCount;
			coin.angle = -coin.maxFlipAngle * Math.pow(percentageCompleted - 1, 2) + coin.maxFlipAngle;

			// Calculate the scale and position of the coin moving through the air
			coin.style.setProperty("--coin-y-multiplier", -11 * Math.pow(percentageCompleted * 2 - 1, 4) + 11);
			coin.style.setProperty("--coin-x-multiplier", percentageCompleted);
			coin.style.setProperty("--coin-scale-multiplier", percentageCompleted * 0.6);
			coin.style.setProperty("--coin-rotation-multiplier", percentageCompleted * coin.sideRotationCount);

			// Calculate the scale and position values for the different coin faces
			// The math uses sin/cos wave functions to similate the circular motion of 3D spin
			coin.style.setProperty("--front-scale-multiplier", Math.max(Math.cos(coin.angle), 0));
			coin.style.setProperty("--front-y-multiplier", Math.sin(coin.angle));

			coin.style.setProperty("--middle-scale-multiplier", Math.abs(Math.cos(coin.angle), 0));
			coin.style.setProperty("--middle-y-multiplier", Math.cos((coin.angle + Math.PI / 2) % Math.PI));

			coin.style.setProperty("--back-scale-multiplier", Math.max(Math.cos(coin.angle - Math.PI), 0));
			coin.style.setProperty("--back-y-multiplier", Math.sin(coin.angle - Math.PI));

			coin.style.setProperty("--shine-opacity-multiplier", 4 * Math.sin((coin.angle + Math.PI / 2) % Math.PI) - 3.2);
			coin.style.setProperty("--shine-bg-multiplier", -40 * (Math.cos((coin.angle + Math.PI / 2) % Math.PI) - 0.5) + "%");

			// Repeat animation loop
			if (coin.moveLoopCount < coin.maxMoveLoopCount) {
				if (coin.moveLoopCount === coin.maxMoveLoopCount - 6) button.classList.add("shrink-landing");
				window.requestAnimationFrame(flipCoinLoop);
			} else {
				button.classList.add("coin-landed");
				coin.style.setProperty("opacity", 0);
				setTimeout(() => {
					button.classList.remove("clicked", "shrink-landing", "coin-landed");
					setTimeout(() => {
						resetCoin();
					}, 300);
				}, 1500);
			}
		};
	});

	//
	// ---Retro Button---
	//
	var buttons = document.querySelectorAll(".buttoncool");

	for (var i = 0; i < buttons.length; i++) {
		// Click
		buttons[i].addEventListener("mousedown", function () {
			this.classList.add("btn-active");
		});
		buttons[i].addEventListener("mouseup", function () {
			this.classList.remove("btn-active");
		});

		// Hover
		buttons[i].addEventListener("mouseleave", function () {
			this.classList.remove("btn-center", "btn-right", "btn-left", "btn-active");
		});

		buttons[i].addEventListener("mousemove", function (e) {
			var leftOffset = this.getBoundingClientRect().left;
			var btnWidth = this.offsetWidth;
			var myPosX = e.pageX;
			var newClass = "";
			// if on left 1/3 width of btn
			if (myPosX < leftOffset + 0.3 * btnWidth) {
				newClass = "btn-left";
			} else {
				// if on right 1/3 width of btn
				if (myPosX > leftOffset + 0.65 * btnWidth) {
					newClass = "btn-right";
				} else {
					newClass = "btn-center";
				}
			}
			var clearedClassList = this.className.replace(/btn-center|btn-right|btn-left/gi, "").trim();
			this.className = clearedClassList + " " + newClass;
		});
	}

	//
	// ---Retro Submit Button---
	//
	/*var pButton = document.querySelector('.loader-button');
  
  // Click
  pButton.addEventListener('mousedown', function() {
    this.classList.add('btn-active');
  });
  pButton.addEventListener('mouseup', function() {
    this.classList.remove('btn-active');
  });*/

	function classReg(className) {
		return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
	}

	// classList support for class management
	// altho to be fair, the api sucks because it won't accept multiple classes at once
	var hasClass, addClass, removeClass;

	if ("classList" in document.documentElement) {
		hasClass = function (elem, c) {
			return elem.classList.contains(c);
		};
		addClass = function (elem, c) {
			elem.classList.add(c);
		};
		removeClass = function (elem, c) {
			elem.classList.remove(c);
		};
	} else {
		hasClass = function (elem, c) {
			return classReg(c).test(elem.className);
		};
		addClass = function (elem, c) {
			if (!hasClass(elem, c)) {
				elem.className = elem.className + " " + c;
			}
		};
		removeClass = function (elem, c) {
			elem.className = elem.className.replace(classReg(c), " ");
		};
	}

	function toggleClass(elem, c) {
		var fn = hasClass(elem, c) ? removeClass : addClass;
		fn(elem, c);
	}

	var classie = {
		// full names
		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,
		toggleClass: toggleClass,
		// short names
		has: hasClass,
		add: addClass,
		remove: removeClass,
		toggle: toggleClass,
	};

	// transport
	if (typeof define === "function" && define.amd) {
		// AMD
		define(classie);
	} else {
		// browser global
		window.classie = classie;
	}

	// Loader Progress Functionality

	function extend(a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	}
}
