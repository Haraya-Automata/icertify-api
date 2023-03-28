const { timestamp, verify, validateInput } = require('./lib/utilities');
const { createCertificate } = require('./lib/create-certificate');

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { create } = require('qrcode');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

let count = 0;
const clients = [];
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`${timestamp()}: (INFO) server has started in port ${PORT}`));

app.use(cors({ origin: 'https://icertify.vercel.app/' }));

// remove both after testing
app.use(express.static('e-certificate-maker-site'));

app.get('/', (req, res) => res.redirect('/generate.html'));

app.get('/logging/:id', sendMessage);

app.post('/verify', [upload.none(), verify]);

app.post('/generate', [logger, upload.single('file'),
  validateInput, createCertificate]);

function logger(req, res, next) {
  clients.push({
    id: count,
    messages: [],
    newMessage: function (message) {
      this.messages.push(message);
    },
    intervalID: 0
  });

  res.client = clients[count++];
  res.client.newMessage('server accepted request');
  res.send(`/logging/${res.client.id}`);

  console.log(`${timestamp()}: (INFO) a client has connected`)
  next();
};

function sendMessage(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.messageCount = 1;

  let client = clients[req?.params?.id];
  client.intervalID = setInterval(() => {
    const client = clients[req?.params?.id];
    if (client?.messages?.at(0) === 'END') {
      clearInterval(client?.intervalID); 
      count--;
    }
    if (client?.messages?.length) {
      res.write(`retry: ${1500}\n`);
      res.write(`data: ${client.messages.shift()}\n\n`);
      res.write(`id: ${res.messageCount++}\n`);
    }
  }, 300);
}



