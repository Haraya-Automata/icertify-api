// this is the module for generating qr code
// a module for generating qr code
const { degrees, colorToComponents } = require('pdf-lib');
const { PDFDocument } = require('pdf-lib');
const QRCode = require('qrcode');

let data = {
     Name:"Jasmine"
}
let strData = JSON.stringify(data)

// a function that generates qr code
const generateQr = async strData => {

// Qr Rendering Options
  const QrOpt = {
    margin: 0.5,
    quality: 0.3,
    light: "00FFFFFF"
  }
  
  // code for generating qr 
  try {
    const  qr = await QRCode.toDataURL(strData,QrOpt);
      console.log(qr);
      return qr;
  } catch(err) {
    console.log(err);
  } 
}
const drawQr = async (cert, qrcode, options, font, generateQr) => {
  // convert qrcode to data url (base64)
  // pass the data url to embedPngImage
  // check this https://pdf-lib.js.org/docs/api/classes/pdfpage#drawimage
  const pngImage = await cert.embedPng(qrcode);
  const page = cert.getPages()[0];
  page.drawImage(pngImage, {
    x: Number(options.xQr),
    y: Number(options.yQr),
    width: 75,
    height: 75,
    });
}

const createQr = async (cert, options, font) => {
  const qrcode = await generateQr(strData);
  drawQr(cert, qrcode, options, font, generateQr);
}

module.exports = { createQr };