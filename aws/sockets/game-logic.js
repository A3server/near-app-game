const nearAPI = require("near-api-js");

const SECONDSTOWAIT = 5; // get all the matches from 1 and 1 second.

let gameSocket;
let io;
let contract = null;

// pConnected stores an array of all active socket connections
var pConnected = [];
var allRooms = [];

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

	contract = new nearAPI.Contract(account, process.env.CONTRACT_NAMEE, {
		// name of contract you're connecting to
		viewMethods: ["view_all_matches"], // view methods do not change state but usually return a value
		sender: process.env.ACC_ID, // account ID of the signing account
	});

	setInterval(function () {
		//console.log("yo")
		//console.log(process.env.CONTRACT_NAMEE)
		viewAllRoomsFromContract().then(function (response) {
			// console.log("all rooms: " + response);
			allRooms = response;
			//! don't do this, poor practice. Simply send the room updates
			//? getRooms();
		});
	}, SECONDSTOWAIT * 1000);
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

	// User creates new game room after clicking 'submit' on the frontend
	gameSocket.on("createNewGame", createNewGame);

	// User joins gameRoom after going to a URL with '/game/:gameId'
	gameSocket.on("playerJoinGame", playerJoinsGame);

	gameSocket.on("request username", requestUserName);

	gameSocket.on("recieved userName", recievedUserName);

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
	console.log(idData);
	// A reference to the player's Socket.IO socket object
	var sock = this;
	//get bc its a map
	var room = allRooms[idData.gameId];
	// If the room exists...
	if (room === undefined || room === null) {
		this.emit("status", "This game no longer exists.");
		return;
	}

	if (room.size < 2) {
		// attach the socket id to the data object.
		idData.mySocketId = sock.id;

		// Join the room
		sock.join(idData.gameId);

		console.log(room.size);

		if (room.size === 2) {
			io.sockets.in(idData.gameId).emit("start game", idData.userName);
		}

		// Emit an event notifying the clients that the player has joined the room.
		io.sockets.in(idData.gameId).emit("playerJoinedRoom", idData);
	} else {
		// Otherwise, send an error message back to the player.
		this.emit("status", "There are already 2 people playing in this room.");
	}
}

function createNewGame(gameId) {
	console.log("game created: " + gameId);

	// this.emit("createNewGame", { gameId: gameId, mySocketId: this.id });

	//console.log(this)

	// Join the Room and wait for the other player
	this.join(gameId);

	//emit to all the clients "rooms"
	getRooms();
}

function requestUserName(gameId) {
	io.to(gameId).emit("give userName", this.id);
}

function recievedUserName(data) {
	data.socketId = this.id;
	io.to(data.gameId).emit("get Opponent UserName", data);
}

exports.initializeGame = initializeGame;
