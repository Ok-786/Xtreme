const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  create: (data, expiresIn) => {
    if (expiresIn)
      return jwt.sign(data, process.env.JWTKEY, { expiresIn: '365d' });
    return jwt.sign(data, process.env.JWTKEY);
  },
  authenticate: (token) => {
    return jwt.verify(token, process.env.JWTKEY);
  },
};
