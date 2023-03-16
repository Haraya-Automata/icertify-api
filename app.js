// This script is the entry point of requests

// modules for setting up the server
const express = require('express');
const cors = require('cors');

const { fileUpload, validateInput } = require('./lib/input-validation');
const { createCertificate } = require('./lib/create-certificate');

const app = express();

// set port to where our server will listen for requests
const PORT = 3000;

// starts server so it can now listen for requests
// this also has a function to log time
app.listen(PORT, () => {
  const time = new Date();
  console.log(`server has started in port: ${PORT} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`);
});

// middleware to allow requests from our e-certificate-maker-site 
app.use(cors({ origin: 'https://haraya-automata.github.io/e-certificate-maker-site/' }));

// middlewares for parsing json and www-form-urlencoded from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// middleware for sending test form 
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/test/index.html");
});

// middleware where form data from the user gets routed
// upload.single() argument must be the name of file form field to process
// it has an array of middlewares that is executed in proper order
app.post('/', [fileUpload.single('certificate'), validateInput, createCertificate],
  // middleware for sending back response to client
  (req, res) => {
    res.send(`<iframe src="${res.certificate}" width="1200" height="1200"></iframe>`);
    console.log('response sent');
  });
