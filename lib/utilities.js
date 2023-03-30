let accounts = [{ username: 'hsuSADAC', password: 'oLNG8Vp7' }];

function timestamp() {
  const time = new Date();
  return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
}

function verify(req, res) {
  console.log(req.body);
  const input = req.body;
  let status = 404;

  for (let account of accounts) {
    if (input.username === account.username &&
      input.password === account.password) {
      console.log(`${timestamp()}: (INFO) authorization success`);
      status = 200;
      break;
    }
  }
  if (status === 404) console.log(`${timestamp()}: (INFO) authorization error`);
  res.status(status).send();
}

function validateInput(req, res, next) {
  try {
    console.log(req.body);
    console.log(`${timestamp()}: (INFO) form data received`);
    console.log(`${timestamp()}: (INFO) validating form data`);

    res.client.newMessage('form data validating');
    validate(req);
  } catch (error) {
    console.log(`${timestamp()} (ERROR) an error has occured while validating form data`, error);
    res.client.newMessage(`an error has occured while validating form data`);
    res.client.newMessage('END');
    return;
  }
  console.log(`${timestamp()}: (INFO) done validating form data`);
  res.client.newMessage('form data validated');
  next();
}

function validate(req) {
  req.options = req.body;
  req.options.names = req.options.names.split('\r\n')
    .filter(name => name !== '');
  req.nameCount = req.options.names.length;
  req.uploads = 0;
  req.counter = 0;

  for (field in req.options) {
    if (['size', 'xQr', 'yQr', 'xName', 'yName'].includes(field)) {
      req.options[field] = Number(req.options[field]);
    }
  }
  console.log(req.options);

}

module.exports = {
  timestamp, verify, validateInput
};