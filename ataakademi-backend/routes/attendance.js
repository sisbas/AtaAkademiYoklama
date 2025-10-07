const express = require('express');
const {
  getAttendanceByClassAndDate,
  upsertAttendance,
  ALLOWED_STATUSES,
} = require('../models/attendance');

const router = express.Router();

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

router.get('/', async (req, res, next) => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      return res.status(400).json({ message: 'classId ve date zorunludur' });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'date alanı YYYY-MM-DD formatında olmalıdır' });
    }

    const attendance = await getAttendanceByClassAndDate(classId, date);
    res.json({ classId, date, records: attendance });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
      return res
        .status(400)
        .json({ message: 'studentId, date ve status alanları zorunludur' });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ message: 'date alanı YYYY-MM-DD formatında olmalıdır' });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Geçersiz status değeri. İzin verilenler: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const record = await upsertAttendance({ studentId, date, status });
    res.json(record);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
