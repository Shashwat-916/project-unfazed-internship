export const PAYMENT_SUCCESS_CLIENT_TEMPLATE = (name: string, appointmentDate: string, amount: string, therapistName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payment Successful - Unfazed</title>
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

    <h2 style="margin-bottom: 20px; color: #111827; border-bottom: 2px solid #ecfdf5; padding-bottom: 10px;">
      Payment Successful, ${name}!
    </h2>

    <p style="color: #4b5563; font-size: 16px;">
      Your payment of <strong>${amount}</strong> was successfully processed.
    </p>
    
    <p style="color: #4b5563; font-size: 16px;">
      Your appointment with <strong>${therapistName}</strong> is confirmed.
    </p>

    <div style="margin: 30px 0; padding: 20px; background-color: #ecfdf5; border-radius: 8px; border: 1px solid #d1fae5;">
      <h3 style="margin-top: 0; color: #059669; font-size: 18px;">Appointment Details</h3>
      <p style="margin: 10px 0 0 0; color: #065f46; font-size: 16px;">
        <strong>Date & Time:</strong> ${appointmentDate}
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      You can view and manage your appointment from your dashboard. If you have any questions or need to reschedule, please log in to your account.
    </p>

    <p style="margin-top: 30px; color: #111827; font-weight: bold;">
      — The Unfazed Team
    </p>

  </div>
</body>
</html>
`;
