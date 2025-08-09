export function generateEmailTemplate(otp: string) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f7f6; padding: 0;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f5132, #198754); padding: 25px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: 1px;">
          JIBONIX BANGLADESH
        </h1>
        <p style="color: #d4edda; font-size: 14px; margin-top: 5px; letter-spacing: 0.5px;">
          Secure & Trusted Verification
        </p>
      </div>

      <!-- Body -->
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
        <p style="font-size: 16px; color: #222; margin-top: 0;">Dear User,</p>

        <p style="font-size: 15px; color: #333; line-height: 1.6;">
          To complete your verification to <strong>Create Account</strong>, please use the security code below:
        </p>

        <!-- OTP Display -->
        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #0f5132; padding: 14px 28px; border: 2px solid #0f5132; border-radius: 8px; background-color: #e9f7ef; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          This code will expire in <strong>5 minutes</strong> for your security. If you did not request this verification, please ignore this email.
        </p>

        <!-- Divider -->
        <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 20px 0;">

        <!-- Footer -->
        <p style="font-size: 13px; color: #888; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} JIBONIX-BANGLADESH. All rights reserved.<br>
          This is an automated message. Please do not reply.
        </p>
      </div>
    </div>
  `
}
