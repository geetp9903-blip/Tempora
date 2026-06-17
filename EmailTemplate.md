# Tempora Password Reset Email Template

Please copy the HTML code below and paste it into the **Message Body** section of the "Reset Password" template in your Supabase Dashboard (`Authentication > Email Templates`).

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Tempora Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0e0e1a;
      color: #ffffff;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #06b6d4;
      margin-bottom: 24px;
      letter-spacing: -0.5px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #ffffff;
    }
    .message {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 32px;
      transition: background-color 0.2s ease;
    }
    .button:hover {
      background-color: #6d28d9;
    }
    .footer {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 40px;
      text-align: center;
    }
    .link-text {
      color: #06b6d4;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Tempora</div>
      <h1 class="title">Reset Your Password</h1>
      <p class="message">
        We received a request to reset the password for your Tempora account. Click the button below to choose a new password.
      </p>
      <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      
      <p class="message" style="font-size: 14px; margin-bottom: 0;">
        If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
    <div class="footer">
      <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
      <p class="link-text">{{ .ConfirmationURL }}</p>
      <p style="margin-top: 24px;">&copy; 2026 Tempora. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```
