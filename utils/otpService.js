import axios from 'axios';

const sendOTP = async (phoneNumber) => {
  try {
    const apiKey = process.env.TWO_FACTOR_API_KEY;
    const templateName = process.env.TWO_FACTOR_TEMPLATE_NAME || 'OTP1';
    const formattedPhone = `+91${phoneNumber}`;

    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${formattedPhone}/AUTOGEN2/${templateName}`;

    const response = await axios.get(url);
    const { Status, OTP, Details } = response.data;

    if (Status === 'Success') {
      return { otp: OTP, sessionId: Details };
    } else {
      throw new Error('Failed to send OTP');
    }
  } catch (error) {
    console.error('OTP sending error:', error.message);
    throw error;
  }
};

export default sendOTP;
