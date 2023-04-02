const express = require("express");
const router = express.Router();
const { login } = require("../../controllers/AuthenticationController");

router.post("/", login);

module.exports = router;