const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../../email-log.txt');

const sendOTPEmail = async (email, otp) => {
  const timestamp = new Date().toLocaleString();
  const content = `
--------------------------------------------------
DATE: ${timestamp}
TO: ${email}
SUBJECT: Margify Password Reset Code
MESSAGE:
Your 6-digit verification code is: ${otp}
This code will expire in 10 minutes.
--------------------------------------------------
\n`;

  try {
    fs.appendFileSync(LOG_FILE, content);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = { sendOTPEmail };
