const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal server error',
    error: err.name || 'SERVER_ERROR'
  };

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry - record already exists';
    error.error = 'DUPLICATE_ENTRY';
    return res.status(409).json(error);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.message = 'Referenced record does not exist';
    error.error = 'INVALID_REFERENCE';
    return res.status(400).json(error);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = err.details[0].message;
    error.error = 'VALIDATION_ERROR';
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.error = 'INVALID_TOKEN';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.error = 'TOKEN_EXPIRED';
    return res.status(401).json(error);
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large';
    error.error = 'FILE_TOO_LARGE';
    return res.status(413).json(error);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error.message = 'Too many files';
    error.error = 'TOO_MANY_FILES';
    return res.status(413).json(error);
  }

  // Custom app errors
  if (err.statusCode) {
    return res.status(err.statusCode).json(error);
  }

  // Default 500 server error
  if (process.env.NODE_ENV === 'production') {
    error.message = 'Something went wrong';
  }

  res.status(500).json(error);
};

module.exports = errorHandler;
