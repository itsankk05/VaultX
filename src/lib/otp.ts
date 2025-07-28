import twilio from 'twilio';

type OtpStore = {
  otp: string;
  expires: number;
};

const otpCache = new Map<string, OtpStore>();
const OTP_VALIDITY_MINUTES = 5;

// IMPORTANT: In a production application, these values should be stored securely in environment variables
// and managed through a proper secrets management system.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function generateOtp(key: string, phoneNumber: string): Promise<string> {
  if (!client || !twilioPhoneNumber) {
    console.error('Twilio client not initialized. Check your environment variables.');
    // Fallback for local development without Twilio credentials
    if (process.env.NODE_ENV !== 'production') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000;
        otpCache.set(key, { otp, expires });
        console.log(`[DEV ONLY] OTP for ${key} (${phoneNumber}): ${otp}`);
        return otp;
    }
    throw new Error('Twilio credentials are not configured.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000;

  otpCache.set(key, { otp, expires });

  try {
    await client.messages.create({
      body: `Your SafeLock OTP is: ${otp}`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    console.log(`OTP sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Failed to send OTP via Twilio:', error);
    // Depending on the desired behavior, you might want to re-throw the error
    // or handle it gracefully.
    throw error;
  }
  
  return otp;
}

export function verifyOtp(key: string, otpToVerify: string): boolean {
  const storedOtp = otpCache.get(key);

  if (!storedOtp) {
    return false;
  }

  const { otp, expires } = storedOtp;

  if (Date.now() > expires) {
    otpCache.delete(key);
    return false;
  }

  if (otp === otpToVerify) {
    otpCache.delete(key); // OTP is single-use
    return true;
  }

  return false;
}
