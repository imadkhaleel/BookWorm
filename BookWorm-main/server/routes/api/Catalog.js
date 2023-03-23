const express = require("express");
const router = express.Router();
const { catalog } = require("../controllers/EbookController");

router.get("/", catalog);

module.exports = router;