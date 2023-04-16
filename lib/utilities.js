let accounts = [{ username: 'hsuSADAC', password: 'oLNG8Vp7' }];

function login(req, res) {
  console.log(req.body);
  const input = req.body;
  let status = 404;

  for (let account of accounts) {
    if (input.username === account.username &&
      input.password === account.password) {
      console.log('(INFO) authentication success');
      status = 200;
      break;
    }
  }
  if (status === 404) console.log('(INFO) authentication error');
  res.status(status).end();
}

function validateInput(req, res, next) {
  try {
    console.log(req.body);
    console.log('(INFO) form data received');
    console.log('(INFO) validating form data');

    validate(req);
    transform(req);
    res.client.newMessage('form data validating');
    res.client.newMessage('form data validated');
    console.log('(INFO) done validating form data');

    next();
  } catch (error) {
    console.log('(ERROR) an error has occured while validating form data', error);
    res.client.newMessage('an error has occured while validating form data');
    res.client.newMessage('END');
  }
}

function validate(req) {
  req.options = req.body;

  if (!req.file || req.file.mimetype !== 'application/pdf'
    && req.file.size > 5000000) throw new Error('no file uploaded');

  const fields = ['issuer', 'date', 'names', 'size', 'font', 'color', 'xName', 'yName', 'xQr', 'yQr'];
  let count = 0;
  Object.keys(req.options).forEach(key => (fields.includes(key)) ? count++ : count);
  if (count !== fields.length) throw new Error('missing field');

  for (options in req.options) {
    if (!options) throw new Error('missing input');
  }
}

function transform(req) {
  req.options.issuer = req.body.issuer.trim();
  req.options.names = req.options.names
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter(name => name !== '')
    .map(name => name.trim());

  req.options.names = [...new Set(req.options.names)];
  req.nameCount = req.options.names.length;
  if (req.nameCount > 50) throw new Error('names are over 50');

  req.uploads = 0;
  req.counter = 0;

  for (const option in req.options) {
    if (['size', 'xQr', 'yQr', 'xName', 'yName'].includes(option)) {
      req.options[option] = Number(req.options[option]);
    }
  }
  console.log(req.options);
}

module.exports = {
  login, validateInput
};