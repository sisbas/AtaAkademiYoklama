const express = require('express');
const { getAttendanceSummary } = require('../models/attendance');

const router = express.Router();

const isValidDate = (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value);

router.get('/', async (req, res, next) => {
  try {
    const { classId, startDate, endDate } = req.query;
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(400).json({ message: 'Tarih alanları YYYY-MM-DD formatında olmalıdır' });
    }
    const summary = await getAttendanceSummary({ classId, startDate, endDate });
    res.json({ filters: { classId, startDate, endDate }, summary });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
