const request = require('request');

module.exports = function(data) {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      uri: 'https://pybin.pw/documents',
      body: data
    }, (err, res, body) => {
      let key = JSON.parse(body)['key'];
      if (key) {
        resolve(`https://pybin.pw/raw/${key}`)
      } else if (err) {
        reject(err);
      } else {
        reject('Unknown error occured.');
      }
    })
  })
}