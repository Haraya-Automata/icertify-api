// this is the module for generating qr code
// a module for generating qr code
const QRCode = require('qrcode');

// a function that generates qr code
const generateQr = async () => {
  // code for generating qr
  return qrcode;
}

const drawQr = (cert, qrcode, options, font) => {
  // convert qrcode to data url (base64)
  // pass the data url to embedPngImage
  // check this https://pdf-lib.js.org/docs/api/classes/pdfpage#drawimage
  const page = cert.getPages()[0];
  page.drawImage(
    // code to draw qr here
  );
}

const createQr = async (cert, options, font) => {
  const qrcode = await generateQr();
  drawQr(cert, qrcode, options, font);
}

module.exports = { createQr };