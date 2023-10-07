const apiLogServices = require('../resources/apiLog/apiLogServices');

const sendResponse = async (res, statusCode, message, data, logId) => {
  if (data) {
    await apiLogServices.updateResponse(logId, message, data, statusCode);
    res.status(statusCode).send({ message, data });
  } else {
    res.status(statusCode).send({ message });
  }
};

module.exports = sendResponse;
