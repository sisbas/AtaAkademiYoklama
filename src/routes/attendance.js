const express = require('express');
const {
  VALID_STATUSES,
  getClassInfo,
  getStudentsWithAttendance,
  saveAttendance,
  deleteAttendance
} = require('../services/attendanceService');
const { ValidationError } = require('../utils/errors');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const classId = req.query.classId || req.query.class;
    const { date } = req.query;

    if (!classId || !date) {
      throw new ValidationError('Sınıf ve tarih zorunludur.', {
        details: { classId, date }
      });
    }

    const students = await getStudentsWithAttendance(classId, date);
    const recordedCount = students.filter(student => VALID_STATUSES.includes(student.status)).length;
    const classInfo = getClassInfo(classId);

    res.json({
      students,
      metadata: {
        classId: classInfo?.id || classId,
        className: classInfo?.name || students[0]?.className || classId,
        date,
        total: students.length,
        recorded: recordedCount,
        hasAttendance: recordedCount > 0
      },
      classInfo
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { studentId, date, status } = req.body || {};

    if (!studentId || !date || !status) {
      throw new ValidationError('Öğrenci, tarih ve durum bilgileri zorunludur.', {
        details: { studentId, date, status }
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError('Geçersiz yoklama durumu.', {
        details: { status }
      });
    }

    const result = await saveAttendance(studentId, date, status);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const { studentId, date } = req.body || {};

    if (!studentId || !date) {
      throw new ValidationError('Öğrenci ve tarih bilgileri zorunludur.', {
        details: { studentId, date }
      });
    }

    const result = await deleteAttendance(studentId, date);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
