# life360-hack

NodeJS module to interface with life360 to find your friends.

*Warning!* This module is not endorsed by life360. It depends on un-published, private life360 APIs that could change without warning. For that reason alone, I have chosen *not* to publish this on npm. Use at your own peril!

## Installation
```
npm install git+https://github.com/rkuzsma/life360-hack.git
```

## Usage
```
const life360 = require('life360-hack');

username = YOUR_LIFE360_USERNAME;
// Or: phone = YOUR_LIFE360_PHONE;
password = YOUR_LIFE360_PASSWORD;

life360.authenticate(username, password, phone).then(session => {
  return life360.circles(session).then(circles => {
    if (circles.length == 0) {
      throw new Error("No circles in your Life360.");
    }
    let circleId = circles[0].id;
    return life360.circle(session, circleId).then(circle => {
      console.log(circle.members);
    });
  });
})
.catch(err => {
  console.log(err);
});
```
