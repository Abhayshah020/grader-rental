
import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

const OTP_SECRET = process.env.ADMIN_SESSION_SECRET;

if (!OTP_SECRET || OTP_SECRET.length < 64) {
  throw new Error(
    "ADMIN_SESSION_SECRET must contain at least 64 characters."
  );
}

export function generateOTP(): string {
  return randomInt(0, 1_000_000)
    .toString()
    .padStart(6, "0");
}

export function hashOTP(
  otp: string,
  challengeId: string
): string {
  return createHmac("sha256", OTP_SECRET!)
    .update(`${challengeId}:${otp}`)
    .digest("hex");
}

export function verifyOTP(
  otp: string,
  storedHash: string,
  challengeId: string
): boolean {
  if (!/^\d{6}$/.test(otp)) {
    return false;
  }

  const suppliedHash = Buffer.from(
    hashOTP(otp, challengeId),
    "hex"
  );

  const expectedHash = Buffer.from(storedHash, "hex");

  if (suppliedHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(suppliedHash, expectedHash);
}
