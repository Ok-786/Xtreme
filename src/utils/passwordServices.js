const bcrypt = require('bcrypt');
const passwordServices = {
  hash: async (password, salt) => {
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  },
  authenticate: async (password, hash) => {
    const passwordMatch = await bcrypt.compare(password, hash);
    return passwordMatch;
  },
};

module.exports = passwordServices;
