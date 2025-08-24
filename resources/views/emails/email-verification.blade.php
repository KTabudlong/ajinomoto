<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - TutorMatch Chicago</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .verification-code {
            background-color: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }
        .expires {
            color: #6b7280;
            font-size: 14px;
            margin-top: 10px;
        }
        .instructions {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 30px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TutorMatch Chicago</div>
            <div class="subtitle">Connecting students with expert tutors</div>
        </div>

        <h1>Verify Your Email Address</h1>
        <p>Thank you for signing up with TutorMatch Chicago! To complete your registration, please enter the verification code below:</p>

        <div class="verification-code">
            <div class="code">{{ $code }}</div>
            <div class="expires">Expires at {{ $expiresAt }}</div>
        </div>

        <div class="instructions">
            <h3>How to verify:</h3>
            <ol>
                <li>Return to the TutorMatch registration page</li>
                <li>Enter the verification code above</li>
                <li>Complete your profile setup</li>
            </ol>
        </div>

        <p><strong>Important:</strong> This verification code will expire in 5 minutes for security reasons. If you need a new code, you can request one from the registration page.</p>

        <p>If you didn't create a TutorMatch account, you can safely ignore this email.</p>

        <div class="footer">
            <p>&copy; 2025 TutorMatch Chicago. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
