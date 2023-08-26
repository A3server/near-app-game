const mongoose = require("mongoose");
const Play = require("../models/play");
const { providers, utils } = require("near-api-js");
let providerurl = "https://archival-rpc." + process.env.netinfo + ".near.org";
const provider = new providers.JsonRpcProvider(providerurl);

console.log("NET: " + process.env.netinfo);

async function gettxsStatus(hash, id) {
	try {
		console.log("HASH: " + hash);
		console.log("ID: " + id);
		hash = hash + "";
		id = id + "";
		if (hash === "" || hash === null || hash === undefined || id === "" || id === null || id === undefined) {
			throw new Error("HASH or ID is empty");
		}

		const result = await provider.txStatus(hash, id);
		return result;
	} catch (err) {
		console.log("Error getting transaction status!");
	}
}

exports.postPlay = (req, res, next) => {
	if (!req.body) {
		return res.status(400).json({
			error: "No body provided",
		});
	}
	console.log("req.body: ", req.body);
	// body is like this {
	// '{\n  "txhash": "DPzYZzhpzPm9vPL9QtH74xjXtYE8PNUKNuJjZw14u45X",\n  "accountid": "edup.near"\n}': ''
	// }
	const bodyJSON = JSON.parse(Object.keys(req.body)[0]);

	gettxsStatus(bodyJSON.txhash, bodyJSON.accountid)
		.then((result) => {
			console.log(result);
			if (!result) {
				return res.status(500).json({
					error: "Transaction invalid.",
				});
			}

			let contract = result.transaction.receiver_id;
			if (contract !== process.env.CONTRACT_NAME) {
				res.status(500).json({
					error: "Invalid contract! What are you trying to do? :eyes: :eyes:",
					message: "Please, if you find any bugs report them to the FlipNear team!",
				});
			}

			// result.status.SuccessValue convert base64 to ascii
			let asciisucess = Buffer.from(result.status.SuccessValue, "base64").toString("ascii");

			if (asciisucess === "false" || asciisucess === "true") {
				let asciiammount = utils.format.formatNearAmount(result.transaction.actions[0].FunctionCall.deposit) / 1.035;

				let optionchoosen = JSON.parse(Buffer.from(result.transaction.actions[0].FunctionCall.args, "base64").toString("ascii")).option;
				let asciichoosen = optionchoosen ? "heads" : "tails";

				/* find a play with this transaction hash */
				Play.findOne({
					tx: bodyJSON.txhash,
				})
					.then((play) => {
						if (play) {
							return res.status(400).json({
								error: "Play already exists",
							});
						} else {
							Play.findOne({
								accountid: bodyJSON.accountid,
							})
								.sort({
									_id: -1,
								})
								.then((play) => {
									let currentwinstreak = 0;
									let streakofplayer = 0;
									let totalwon = asciiammount;

									if (play) {
										streakofplayer = play.streak;
										totalwon = play.totalammountwon;
										if (asciisucess === "true") {
											totalwon = play.totalammountwon + asciiammount;
											if (streakofplayer >= 0) {
												currentwinstreak = play.streak + 1;
											}
										} else {
											if (streakofplayer <= 0) {
												currentwinstreak = play.streak - 1;
											}
										}
									}
									const newplay = new Play({
										_id: new mongoose.Types.ObjectId(),
										walletaccount: bodyJSON.accountid,
										tx: bodyJSON.txhash,
										ammount: asciiammount,
										streak: currentwinstreak,
										side: asciichoosen,
										won: asciisucess,
										totalammountwon: totalwon,
									});
									//console.log("New Play created!");
									newplay
										.save()
										.then((result) => {
											return res.status(201).json({
												message: "Play created successfully!",
												play: {
													...result,
													id: result._id,
												},
											});
										})
										.catch((err) => {
											console.log(err);
											return res.status(500).json({
												error: err,
											});
										});
								})
								.catch((err) => {
									console.log(err);
									return res.status(500).json({
										error: "Couldn't fetch player's plays",
									});
								});
						}
					})
					.catch((err) => {
						console.log(err);
						return res.status(500).json({
							error: "error fetching database",
						});
					});
			} else {
				// try to parse as json
				const result = JSON.parse(asciisucess);
				/* {"id":44,"creator":"jeknowledge.near","winner":"jeknowledge.near","result":true,"amount":10000000000000001965601}*/
				// update the plays table
				console.log(result);
				let asciichoosen = result.result ? "heads" : "tails";
				// convert result,amount to big nubmer

				let amountWon = utils.format.formatNearAmount(result.amount.toLocaleString("fullwide", { useGrouping: false }));
				console.log(amountWon);
				amountWon = Math.round(amountWon * 100) / 100;

				Play.findOne({
					tx: bodyJSON.txhash,
				})
					.then((play) => {
						if (play) {
							return res.status(400).json({
								error: "Play already exists",
							});
						} else {
							Play.findOne({
								accountid: bodyJSON.accountid,
							})
								.sort({
									_id: -1,
								})
								.then((play) => {
									let currentwinstreak = 0;
									let streakofplayer = 0;
									let totalwon = amountWon * 2;

									if (play) {
										streakofplayer = play.streak;
										totalwon = play.totalammountwon;
										if (bodyJSON.accountid === result.winner) {
											totalwon = play.totalammountwon + amountWon;
											if (streakofplayer >= 0) {
												currentwinstreak = play.streak + 1;
											}
										} else {
											if (streakofplayer <= 0) {
												currentwinstreak = play.streak - 1;
											}
										}
									}
									const newplay = new Play({
										_id: new mongoose.Types.ObjectId(),
										walletaccount: bodyJSON.accountid,
										tx: bodyJSON.txhash,
										ammount: amountWon,
										streak: currentwinstreak,
										side: asciichoosen,
										won: bodyJSON.accountid === result.winner,
										totalammountwon: totalwon,
									});
									//console.log("New Play created!");
									newplay
										.save()
										.then((result) => {
											return res.status(201).json({
												message: "Play created successfully!",
												play: {
													...result,
													id: result._id,
												},
											});
										})
										.catch((err) => {
											console.log(err);
											return res.status(500).json({
												error: err,
											});
										});
								})
								.catch((err) => {
									console.log(err);
									return res.status(500).json({
										error: "Couldn't fetch player's plays",
									});
								});
						}
					})
					.catch((err) => {
						console.log(err);
						return res.status(500).json({
							error: "error fetching database",
						});
					});
			}
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({
				message: "Error getting transaction status!",
				error: err,
			});
		});
};

exports.getRecentPlays = (req, res, next) => {
	/* Get the 12 recent plays */
	Play.find()
		.sort({
			_id: -1,
		})
		.limit(12)
		.then((plays) => {
			res.status(200).json({
				message: "Fetched plays successfully!",
				plays: plays,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
};

exports.gettopplays = (req, res, next) => {
	/* Get the plays with the biggest winstreak, dont show repeated players and recieve also the streak number from the distinct players */
	Play.aggregate([
		{
			$group: {
				_id: "$walletaccount",
				streak: {
					$max: "$streak",
				},
				date: {
					$max: "$date",
				},
			},
		},
		{
			$sort: {
				streak: -1,
			},
		},
		{
			$limit: 12,
		},
	])
		.then((plays) => {
			res.status(200).json({
				message: "Fetched plays successfully!",
				plays: plays,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
};

exports.getBestPlayers = (req, res, next) => {
	/* sort by the players with the biggest total won */
	Play.aggregate([
		{
			$group: {
				_id: "$walletaccount",
				totalammountwon: {
					$max: "$totalammountwon",
				},
				date: {
					$max: "$date",
				},
			},
		},
		{
			$sort: {
				totalwon: -1,
			},
		},
		{
			$limit: 12,
		},
	])
		.then((plays) => {
			res.status(200).json({
				message: "Fetched plays successfully!",
				plays: plays,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
};
