// this module consists of functions that process the certificate generation
// a module for handling multipart/form-data(form fields and files)
const multer = require('multer');

// certificate template uploaded by client is stored in memory
const storage = multer.memoryStorage();
const fileUpload = multer({ storage: storage });

const validateInput = (req, res, next) => {
  const certOptions = req.body;
  certOptions.names = req.body.names.split('\r\n');
  req.options = certOptions;
  console.log(certOptions.names);
  next();
}

module.exports = { fileUpload, validateInput };