const express = require("express");
const router = express.Router();
const { logout } = require("../../controllers/AuthenticationController");

router.post("/", logout);

module.exports = router;