type OtpStore = {
  otp: string;
  expires: number;
};

const otpCache = new Map<string, OtpStore>();
const OTP_VALIDITY_MINUTES = 5;

export function generateOtp(key: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000;
  
  otpCache.set(key, { otp, expires });
  
  console.log(`OTP for ${key}: ${otp}`); // For simulation/testing
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
