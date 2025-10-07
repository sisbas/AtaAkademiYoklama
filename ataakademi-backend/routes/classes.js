const express = require('express');
const { getAllClasses } = require('../models/class');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const classes = await getAllClasses();
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
