let accounts = [{ username: 'hsuSADAC', password: 'oLNG8Vp7' }];

function login(req, res) {
  console.log(req.body);
  const input = req.body;
  let status = 404;

  for (let account of accounts) {
    if (input.username === account.username &&
      input.password === account.password) {
      console.log('(INFO) authorization success');
      status = 200;
      break;
    }
  }
  if (status === 404) console.log('(INFO) authorization error');
  res.status(status).end();
}

function validateInput(req, res, next) {
  try {
    console.log(res.client);
    console.log(req.body);
    console.log('(INFO) form data received');
    console.log('(INFO) validating form data');

    validate(req);
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
  req.options.issuer = req.body.issuer.trim();
  req.options.names = req.options.names
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter(name => name !== '')
    .map(name => name.trim());
  
  req.nameCount = req.options.names.length;
  req.uploads = 0;
  req.counter = 0;

  for (let field in req.options) {
    if (['size', 'xQr', 'yQr', 'xName', 'yName'].includes(field)) {
      req.options[field] = Number(req.options[field]);
    }
  }
  console.log(req.options);
}

module.exports = {
  login, validateInput
};