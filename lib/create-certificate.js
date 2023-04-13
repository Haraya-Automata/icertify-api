const { getFolder, uploadToDrive } = require('./upload-to-drive');
const { PDFDocument, rgb } = require('pdf-lib');
const { createQr } = require('./create-qr');

function isNameTooLong(name, options) {
  options.newSize = options.size;
  if (name.length > 15 && name.length < 30) {
    options.newSize -= 12;
  } else if (name.length > 30) {
    if (name.length >= 45) {
      options.newSize -= (options.size <= 40) ? 22 : 27;
    } else {
      options.newSize -= 17;
    }
  }
}

function getRGB(color) {
  return {
    black: rgb(0, 0, 0),
    white: rgb(1, 1, 1),
    red: rgb(1, 0, 0),
    green: rgb(0, 1, 0),
    blue: rgb(0, 0, 1),
    yellow: rgb(1, 1, 0),
    violet: rgb(1, 0, 1),
    orange: rgb(1, 0.5, 0)
  }[color];
}

const drawName = (page, name, options, font) => {
  isNameTooLong(name, options);
  page.drawText(name, {
    x: page.getWidth() / 2 + options.xName,
    y: page.getHeight() / 2 + options.yName,
    font: font,
    size: options.newSize,
    color: getRGB(options.color)
  });
}

const createCertificate = async (req, res, next) => {
  console.log(`(INFO) generating ${req.nameCount} certificates`);
  res.client.newMessage(`generating ${req.nameCount} certificates`);

  try {
    const template = await PDFDocument.load(req.file.buffer);
    const options = req.options;

    res.folder = await getFolder(res);
    console.log(res.folder);

    for (let name of options.names) {
      const cert = await template.copy();
      const font = await cert.embedFont(options.font);
      const page = cert.getPage(0);
      cert.setTitle(name);

      drawName(page, name, options, font);
      await createQr(cert, page, options, name);
      const certificate = await cert.save();

      res.client.newMessage(`generated certificate for ${name}`);
      res.client.newMessage(`generated ${++req.counter} / ${req.nameCount} certificates`);
      uploadToDrive(req, res, certificate, name);
    }
    console.log(`(INFO) done generating ${req.nameCount} certificates`);
  } catch (error) {
    console.log('ERROR) an error has occured while creating certificates', error);
    res.client.newMessage('an error has occured while creating certificate');
    res.client.newMessage('END');
  }
}

module.exports = { createCertificate };

