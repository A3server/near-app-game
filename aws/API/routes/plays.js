//esta file controla as dividas em geral.
const express = require("express");
const PlaysController = require("../controllers/plays");
const router = express.Router();

router.get("/", PlaysController.getRecentPlays);

router.get("/top", PlaysController.gettopplays);

router.get("/best", PlaysController.getBestPlayers);

router.post("/", PlaysController.postPlay);

module.exports = router;
