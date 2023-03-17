// this is the module for drawing names
// a module for manipulating pdf files
const { PDFDocument, rgb } = require('pdf-lib');
const { createQr } = require('./create-qr');
const { uploadToDrive } = require('./upload-to-drive')

// a function that draws name to the certificate
const drawName = (cert, name, options, font) => {
  const page = cert.getPages()[0];
  page.drawText(name, {
    x: Number(options.xName),
    y: Number(options.yName),
    font: font,
    size: Number(options.size),
    color: rgb(0, 0, 0)
    // color: rgb(cert.red, cert.green, cert.blue)
  });
}

// middleware for generating certificates 
// use res.certificate to store the certificate generated
const createCertificate = async (req, res, next) => {
  const template = await PDFDocument.load(req.file.buffer);
  const options = req.options;

  for (let name of options.names) {
    const cert = await template.copy();
    const font = await cert.embedFont(options.font);
    drawName(cert, name, options, font);
    await createQr(cert, options, font); 
    res.certificate = await cert.saveAsBase64({ dataUri: true });
    // put uploadToDrive(res.certificate)
    console.log(`certificate generated for ${name}`);
  }
  next();
}

module.exports = { createCertificate };

