const QRCode = require('qrcode');

const generateQr = async (options, name) => {
  const url = 'https://icertify.vercel.app/verify.html?q=';
  const data = {
    name: name,
    issuer: options.issuer,
    date: options.date,
  }
  const text = url + Buffer.from(JSON.stringify(data)).toString('base64');
  return QRCode.toDataURL(text, { margin: 0.5 });
}

const drawQr = async (cert, page, qrcode, options) => {
  const image = await cert.embedPng(qrcode);
  page.drawImage(image, {
    x: options.xQr,
    y: options.yQr,
    width: 60,
    height: 60
  });
}

const createQr = async (cert, page, options, name) => {
  const qr = await generateQr(options, name);
  drawQr(cert, page, qr, options);
}

module.exports = { createQr };