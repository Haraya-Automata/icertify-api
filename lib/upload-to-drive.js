const { timestamp } = require('./utilities');

async function getFolder(res) {
  try {
    console.log(`${timestamp()} (INFO) creating upload folder`);
    res.client.newMessage(`creating upload folder`);

    const url = `https://script.google.com/macros/s/AKfycbwOa6hRywtYwcGffTyqq3qLC8-4id_yKrps1YLsj4nDmVPVc7472BY2hwW1cldnf_DnRQ/exec`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok') {
      console.log(`${timestamp()} (INFO) done creating upload folder`);
      res.client.newMessage(`done creating upload folder`);
      return data;
    } else {
      throw new Error();
    }

  } catch (error) {
    res.client.newMessage(`an error has occured while getting folder`);
    res.client.newMessage(`END`);
    console.log(`${timestamp()} (ERROR) an error has occured while getting folder`, error);
    return;
  }
}

function uploadToDrive(req, res, cert, name) {
  const query = new URLSearchParams({
    fileName: name,
    folder: res.folder.id,
    mimeType: 'application/pdf',
  });

  const url = `https://script.google.com/macros/s/AKfycbzGJ7iigYJ6v5E3sBqizj8JPgva5y-OsqWDnjh6QCIHbOkH9CH18k4flt9bl2xD7oQf/exec?${query}`;
  const options = { method: 'POST', body: JSON.stringify([...new Int8Array(cert)]) };

  fetch(url, options)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        res.client.newMessage(`uploaded ${name}'s certificate`);
        res.client.newMessage(`uploaded ${++req.uploads} / ${req.nameCount} certificates`);
        if (req.uploads === req.nameCount) response(req, res);
      } else {
        console.log(data);
        throw new Error(data);
      }
    })
    .catch(error => {
      res.client.newMessage(`an error has occured while uploading certificates`);
      res.client.newMessage(`END`);
      console.log(`${timestamp()} (ERROR) an error has occured while uploading certificates`, error);
    });
}

function response(req, res) {
  res.client.newMessage(`done uploading ${req.uploads} certificates`);
  res.client.newMessage(`${res.folder.url}`);
  res.client.newMessage('server is now ending connection');
  res.client.newMessage('END');
  res.status(404).send();

  console.log(`${timestamp()}: (INFO) a client has disconnected`);
};

module.exports = { uploadToDrive, getFolder };