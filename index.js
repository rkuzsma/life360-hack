"use strict";
const Promise = require("bluebird");
const request = Promise.promisify(require("request"));
Promise.promisifyAll(request);

// This is hard-coded in https://www.life360.com/circles/scripts/ccf35026.scripts.js
const LIFE360_CLIENT_SECRET = "U3dlcUFOQWdFVkVoVWt1cGVjcmVrYXN0ZXFhVGVXckFTV2E1dXN3MzpXMnZBV3JlY2hhUHJlZGFoVVJhZ1VYYWZyQW5hbWVqdQ==";

/**
* Login to life360.com and get an oauth token.
* Specify a username OR both a phone number and country code.
* username:     Life360 username, or undefined if phone specified.
* password:     Life360 password.
* phone:        Life360 phone, or undefined if username specified.
* countryCode:  Optional phone country code, defaults to 1 if not specified.
* returns:      Life360 session.
*/
module.exports.authenticate = function(username, password, phone, countryCode) {
  return new Promise((resolve, reject) => {
    countryCode = typeof countryCode !== 'undefined' ? countryCode : 1;
    username = typeof username !== 'undefined' ? username : '';
    phone = typeof phone !== 'undefined' ? phone : '';
    if(!password) throw new Error("No password specified.");

    const LIFE360_LOGIN_URL = "https://www.life360.com/v3/oauth2/token.json";
    const LIFE360_LOGIN_POSTDATA =
      `countryCode=${countryCode}&username=${username}&phone=${phone}&password=${password}&grant_type=password`;
    const options = {
      url: LIFE360_LOGIN_URL,
      method: 'POST',
      body: LIFE360_LOGIN_POSTDATA,
      headers: {
        'Authorization': `Authorization: Basic ${LIFE360_CLIENT_SECRET}`,
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      json: true
    };
    // console.log(`Logging in as user: ${username}, phone: ${phone}`);
    request(options)
      .then(response => {
        response = response.body;
        if (!response['access_token']) throw new Error("Unauthorized");
        const session = {
          access_token: response['access_token'],
          token_type: response['token_type']
        }
        // console.log(`Logged in as user: ${username}, phone: ${phone}, access_token: ${session.access_token}`);
        resolve(session);
      })
      .catch(err => {
        reject(new Error("Unauthorized"));
      });
  });
}

/**
* Fetch the user's circles
*/
module.exports.circles = function(session) {
  if (!session) throw new Error("session not specified");
  return new Promise((resolve, reject) => {
    const LIFE360_CIRCLES_URL = "https://www.life360.com/v3/circles"
    const options = {
      url: LIFE360_CIRCLES_URL,
      headers: {
        'Authorization': `${session.token_type} ${session.access_token}`
      },
      json: true
    };
    // console.log(`Fetching circles at ${LIFE360_CIRCLES_URL}`);
    request(options)
      .then(response => {
        let circles = response.body.circles;
        resolve(circles);
      });
  });
}

/**
* Fetch a specific circle by circle ID
*/
module.exports.circle = function(session, circleId) {
  return new Promise((resolve, reject) => {
    if (!session) throw new Error("session not specified");
    if (!circleId) throw new Error("circleId not specified");
    const LIFE360_CIRCLE_URL = `https://www.life360.com/v3/circles/${circleId}`
    const options = {
      url: LIFE360_CIRCLE_URL,
      headers: {
        'Authorization': `${session.token_type} ${session.access_token}`
      },
      json: true
    };
    // console.log(`Fetching circle at ${LIFE360_CIRCLE_URL}`);
    request(options)
      .then(response => {
        let circle = response.body;
        resolve(circle);
      });
  });
}
