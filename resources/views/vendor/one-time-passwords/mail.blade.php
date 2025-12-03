<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OTP Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <tr>
            <td style="padding: 30px; text-align: center;">
                <!-- Logo -->
                <img src="{{ asset('EBOTO_Colored.png') }}" alt="App Logo" style="height: 40px; margin-bottom: 20px;">

                <!-- Title -->
                <h2 style="color: #111827; font-size: 20px; margin-bottom: 10px;">Verification Code</h2>

                <!-- Instructions -->
                <p style="color: #374151; font-size: 15px; margin-bottom: 25px;">
                    Use the code below to complete your login
                </p>

                <!-- OTP Box -->
                <div style="display: inline-block; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px 30px; margin-bottom: 25px;">
                    <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #16a34a">
                        {{ $oneTimePassword->password }}
                    </span>
                </div>

                <!-- Footer Note -->
                <p style="color: #6b7280; font-size: 13px; margin-top: 10px;">
                    This code will expire in a few minutes. Do not share it with anyone.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
