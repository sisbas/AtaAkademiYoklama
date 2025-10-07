const express = require('express');
const { getClasses } = require('../services/attendanceService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getClasses());
});

module.exports = router;
