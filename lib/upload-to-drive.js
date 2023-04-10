async function getFolder(res) {
  try {
    console.log('(INFO) creating upload folder');
    res.client.newMessage(`creating upload folder`);

    const url = `https://script.google.com/macros/s/AKfycbwOa6hRywtYwcGffTyqq3qLC8-4id_yKrps1YLsj4nDmVPVc7472BY2hwW1cldnf_DnRQ/exec`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok') {
      console.log('(INFO) done creating upload folder');
      res.client.newMessage(`done creating upload folder`);
      return data;
    } else {
      throw new Error();
    }
  } catch (error) {
    res.client.newMessage(`an error has occured while getting folder`);
    res.client.newMessage(`END`);
    console.log('(ERROR) an error has occured while getting folder', error);
  }
}

function uploadToDrive(req, res, cert, name) {
  const query = new URLSearchParams({
    issuer: req.options.issuer,
    fileName: name,
    folder: res.folder.id,
    mimeType: 'application/pdf'
  });

  const url = `https://script.google.com/macros/s/AKfycbw3ZoOJTszWP7gyTby7hSklrAUCpgfD7nMbGWPbOwNS_iRgMrdPynwwH5q7PdA5rUux/exec?${query}`;
  const options = { method: 'POST', body: JSON.stringify([...new Int8Array(cert)]) };

  fetch(url, options)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        res.client.newMessage(`uploaded certificate for ${name}`);
        res.client.newMessage(`uploaded ${++req.uploads} / ${req.nameCount} certificates`);
        if (req.uploads === req.nameCount) response(req, res);
      } else {
        console.log(data);
        throw new Error(data);
      }
    })
    .catch(error => {
      console.log('(ERROR) an error has occured while uploading certificates', error);
      res.client.newMessage('an error has occured while uploading certificates');
      res.client.newMessage('END');
    });
}

function response(req, res) {
  console.log(`(INFO) done uploading ${req.uploads} certificates`);
  res.client.newMessage(`done uploading ${req.uploads} certificates`);
  res.client.newMessage(`${res.folder.url}`);
  res.client.newMessage('server is now ending connection');
  res.client.newMessage('END');
};

module.exports = { getFolder, uploadToDrive };