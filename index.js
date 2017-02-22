const dotenv = require('dotenv');
const google = require('googleapis');

dotenv.config();

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);

const urlshortener = google.urlshortener('v1');

const clientId = '466556299840-fun0r1imak181da5rs5p39h687q3rpmj.apps.googleusercontent.com';
const clinetSecret = 'QWi8sFDCdW_8hZSqcMXU4uVY';

const params = {
  shortUrl: 'http://goo.gl/xKbRu3'
};
 
// get the long url of a shortened url 
urlshortener.url.get(params, function (err, response) {
  if (err) {
    console.log('Encountered error', err);
  } else {
    console.log('Long url is', response.longUrl);
  }
});