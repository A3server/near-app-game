const nearAPI = require("near-api-js");

const SECONDSTOWAIT = 5; // get all the matches from 1 and 1 second.

let gameSocket;
let io;
let contract = null;

// pConnected stores an array of all active socket connections
var pConnected = [];
var allRooms = [];
var games = new Array(100000); // ! I SHOULDNT DO THIS I WILL CRASH SOME SHIT BUT FUCK IT
for (let i = 0; i < games.length; i++) {
	games[i] = [];
}

require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEYY; //TODO: on product get the correct wallet rn is from polpy.testnet
console.log("pvk: " + PRIVATE_KEY);

// call view_all_matches

async function viewAllRoomsFromContract() {
	let response = null;
	try {
		if (contract === null) {
			// wait 150ms
			await new Promise((r) => setTimeout(r, 150));
		}
		response = await contract.view_all_matches();
	} catch (error) {
		console.log(error);
	}
	return response;
}

exports.init = async (iosocket) => {
	io = iosocket;

	const { keyStores, KeyPair } = nearAPI;
	const keyStore = new keyStores.InMemoryKeyStore();
	const KP = KeyPair.fromString(PRIVATE_KEY);
	await keyStore.setKey(process.env.netinfo, process.env.ACC_ID, KP);
	const config = {
		networkId: process.env.netinfo,
		keyStore,
		nodeUrl: "https://rpc.mainnet.near.org",
		walletUrl: "https://wallet.near.org",
		helperUrl: "https://helper.mainnet.near.org",
		explorerUrl: "https://explorer.mainnet.near.org",
	};
	/*
    const config =  {
      networkId: process.env.netinfo,
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
    }
  */

	const near = await nearAPI.connect(config);
	const account = await near.account(process.env.ACC_ID);

	contract = new nearAPI.Contract(account, process.env.CONTRACT_NAME, {
		// name of contract you're connecting to
		viewMethods: ["view_all_matches"], // view methods do not change state but usually return a value
		sender: process.env.ACC_ID, // account ID of the signing account
	});

	getRooms();
};

const initializeGame = (io, socket) => {
	/*
	 * initializeGame sets up all the socket event listeners.
	 */

	// initialize global variables.
	gameSocket = socket;

	// pushes this socket to an array which stores all the active sockets.
	pConnected.push(gameSocket);

	console.log("Current Connected: " + pConnected.length);

	// Emit an event notifying the clients the rooms
	// gameSocket.on("gettables", getRooms);

	//
	// Tables Update Logic
	//
	gameSocket.on("updateRooms", getRooms);

	//
	// Room 1v1 Logic
	//

	// User joins gameRoom after going to a URL with '/game/:gameId'
	gameSocket.on("playerJoinGame", playerJoinsGame);

	gameSocket.on("playerLeavesGame", playerLeavesGame);

	gameSocket.on("playerStartedGame", playerStartedGame);

	// Run code when the client disconnects from their socket session.
	gameSocket.on("disconnect", onDisconnect);
};

function getRooms() {
	viewAllRoomsFromContract()
		.then((response) => {
			// console.log("all rooms: " + response);
			allRooms = response;

			// broadcast to all the clients "rooms" not just the one that requested it
			io.sockets.emit("rooms", response);
			console.log("Emitted Rooms");
		})
		.catch((error) => {
			console.log(error);
		});
}

function onDisconnect() {
	var i = pConnected.indexOf(gameSocket);
	pConnected.splice(i, 1);
	console.log("Current Connected: " + pConnected.length);
}

function playerJoinsGame(idData) {
	/**
	 ** Joins the given socket to a session with it's gameId
	 **/
	console.log("Player " + idData.account_id + " attempting to join game: " + idData.roomid);

	// rooms are an array of rooms like: {id: 13, creator: 'flipnear.near', face: true, entry_price: 9.828009828009829e+21, rent: 640000000000000000000}
	// get the room with the id idDATA
	const roomContract = allRooms.find((room) => room.id === idData.roomid);
	// If the room doesn't exist...
	if (roomContract === undefined || roomContract === null) {
		console.log("Room does not exist.");
		this.emit("status", "This game session does not exist.");
		return;
	}

	// check if player is already in the room
	if (games[idData.roomid].includes(idData.account_id)) {
		console.log("Player " + idData.account_id + " already in room.");
		this.emit("status", "You are already in this game session.");
		return;
	}

	console.log("Adding Player " + idData.account_id + " to room: " + idData.roomid);

	// add player to the game
	games[idData.roomid].push(idData.account_id);

	console.log(games[idData.roomid]);

	// Emit an event notifying the clients that the player the clients connected to the room
	io.sockets.emit("playerJoinedRoom", {
		roomid: idData.roomid,
		account_id: idData.account_id,
	});
}

function playerLeavesGame(idData) {
	console.log("Player " + idData.account_id + " attempting to leave game: " + idData.roomid);

	// rooms are an array of rooms like: {id: 13, creator: 'flipnear.near', face: true, entry_price: 9.828009828009829e+21, rent: 640000000000000000000}
	// get the room with the id idDATA
	const roomContract = allRooms.find((room) => room.id === idData.roomid);
	if (roomContract === undefined || roomContract === null) {
		console.log("Room does not exist.");
		this.emit("status", "This game session does not exist.");
		return;
	}

	// check if player is in the room
	if (!games[idData.roomid].includes(idData.account_id)) {
		console.log("Player " + idData.account_id + " not in room.");
		this.emit("status", "You are not in this game session.");
		return;
	}

	console.log("Removing Player " + idData.account_id + " from room: " + idData.roomid);

	// remove player from the game
	games[idData.roomid].splice(games[idData.roomid].indexOf(idData.account_id), 1);

	// Emit an event notifying the clients that the player the clients connected to the room
	io.sockets.emit("playerLeftRoom", {
		roomid: idData.roomid,
		account_id: idData.account_id,
	});
}

function playerStartedGame(gameData) {
	io.sockets.emit("beginNewGame", gameData);
}

exports.initializeGame = initializeGame;
