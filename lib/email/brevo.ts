
interface SendOTPEmailParams {
  email: string;
  otp: string;
}

export async function sendOTPEmail({
  email,
  otp,
}: SendOTPEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey || !senderEmail || !senderName) {
    throw new Error("Brevo email configuration is missing.");
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email,
          },
        ],
        subject: "Your Grader Rental Admin Login OTP",
        textContent: `Your verification code is ${otp}. It expires in 10 minutes. If you did not request this code, ignore this email.`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <body style="font-family:Arial,sans-serif;background:#f5f7f6;padding:30px;">
              <div style="max-width:480px;margin:auto;background:#fff;padding:30px;border-radius:12px;">
                <h2 style="color:#267a65;">Admin Login Verification</h2>

                <p>Your verification code is:</p>

                <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#267a65;padding:20px 0;">
                  ${otp}
                </div>

                <p>This OTP expires in <strong>10 minutes</strong>.</p>

                <p style="color:#777;font-size:13px;">
                  If you did not request this login, please ignore this email.
                </p>

                <hr style="border:none;border-top:1px solid #eee;" />

                <p style="font-size:12px;color:#999;">
                  Siraha Grader Roller Rental Service
                </p>
              </div>
            </body>
          </html>
        `,
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    console.error("Brevo API error:", response.status, error);

    throw new Error("Unable to send verification email.");
  }

  return true;
}
