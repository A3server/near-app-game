const express = require("express");
const app = express();
const mongoose = require("mongoose");
const gameLogic = require("./sockets/game-logic");
const bodyParser = require("body-parser");

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

require("dotenv").config();

const playsRoutes = require("./API/routes/plays");
//const userRoutes = require("./API/routes/users")
const cors = require("cors");
const corsOptions = {
	origin: "*",
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
};

try {
	///
	/// DB Logic
	///
	console.log("DB: " + process.env.DB_CONNECTION);
	mongoose.connect(process.env.DB_CONNECTION, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	mongoose.Promise = global.Promise;

	///
	/// Socket Logic
	///

	// Socket Port
	app.set("port", process.env.PORT || 5000);

	io.on("connection", function (client) {
		// console.log("New client connected (id=" + client.id + ").");

		// Fetching Rooms
		gameLogic.init(io);

		gameLogic.initializeGame(io, client);
	});

	server.listen(app.get("port")).on("listening", () => {
		console.log("\nSocket 🚀 are live on " + app.get("port"));
	});

	///
	/// API Logic
	///
	app.use(
		bodyParser.urlencoded({
			extended: true,
		})
	);
	app.use(express.json());
	app.use(cors(corsOptions));
	app.use("/plays", playsRoutes);

	// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
	app.all("*", function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});

	app.use((err, req, res, next) => {
		const status = err.status || 500;

		console.log(status);
		console.log(err);
		res.status(status).json({
			message: "Error not found! Status: " + status,
		});
	});
} catch (err) {
	console.log(err);
}

module.exports = app;
