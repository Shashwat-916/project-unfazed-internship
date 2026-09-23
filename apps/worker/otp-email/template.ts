export const EMAIL_OTP_TEMPLATE = (name: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Unfazed Verification Code</title>
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 40px; border-radius: 12px;">

    <h2 style="margin-bottom: 10px; color: #111827;">
      Welcome to Unfazed, ${name}
    </h2>

    <p style="color: #4b5563; font-size: 16px;">
      Use the verification code below to continue:
    </p>

    <div style="
      margin: 30px 0;
      padding: 20px;
      text-align: center;
      background-color: #ecfdf5;
      border-radius: 8px;
    ">
      <span style="
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #059669;
      ">
        ${otp}
      </span>
    </div>

    <p style="color: #6b7280;">
      This code will expire in <strong>10 minutes</strong>.
    </p>

    <p style="color: #6b7280;">
      If you didn't request this code, you can safely ignore this email.
    </p>

    <p style="margin-top: 30px; color: #111827;">
      — The Unfazed Team
    </p>

  </div>
</body>
</html>
`;