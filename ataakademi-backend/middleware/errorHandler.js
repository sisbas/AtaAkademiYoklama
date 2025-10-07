module.exports = (err, _req, res, _next) => {
  console.error('Hata yakalandı:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Beklenmeyen bir hata oluştu';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
