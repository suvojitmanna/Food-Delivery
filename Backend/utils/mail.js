import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOtpEmail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"Vingo Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "🔒 Reset your password — Vingo",
            html:`
                <html>
                    <head>
                        <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Your OTP Code</title>
                            </head>
                            <body style=margin: 0;padding: 0;background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, -webkit-font-smoothing: antialiased;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
                                <tr>
                                    <td align="center">
                                        <!-- Main Card Container -->
                                        <table width="100%" id="email-card" border="0" cellspacing="0" cellpadding="0" style=" max-width: 460px;background-color: #18181b;border: 1px solid rgba(255, 255, 255, 0.08);border-radius: 16px;padding: 32px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">

                                            <!-- App Logo / Header Section -->
                                            <tr>
                                                <td align="center" style="padding-bottom: 24px;">
                                                    <h1 style="margin: 0;font-size: 28px;font-weight: 800;color: #ff4d2d;letter-spacing: -0.5px;">Vingo</h1>
                                                </td>
                                            </tr>

                                            <!-- Title -->
                                            <tr>
                                                <td align="center" style="padding-bottom: 12px;">
                                                    <h2 style="margin: 0;font-size: 20px;font-weight: 600;color: #ffffff;">Verification Code</h2>
                                                </td>
                                            </tr>

                                            <!-- Subtitle Context -->
                                            <tr>
                                                <td align="center" style="padding-bottom: 28px;">
                                                    <p style="margin: 0;font-size: 14px;color: #a1a1aa;line-height: 1.5;">
                                                        Please use the following single-use One-Time Password (OTP) to complete your password reset request.
                                                    </p>
                                                </td>
                                            </tr>

                                            <!-- Premium Display Box for OTP -->
                                            <tr>
                                                <td align="center" style="padding-bottom: 24px;">
                                                    <div style="background: rgba(255, 77, 45, 0.06);border: 1px solid rgba(255, 77, 45, 0.25);display: inline-block;padding: 14px 32px;border-radius: 12px;">
                                                        <span style="font-family: 'Courier New', Courier, monospace;font-size: 32px;-weight: 700;color: #ff4d2d;letter-spacing: 6px;padding-left: 6px; /* Balance the last element's spacing */">
                                                            ${otp}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>

                                            <!-- Expiration Note -->
                                            <tr>
                                                <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
                                                    <p style="margin: 0;font-size: 13px;color: #f87171;font-weight: 500;background-color: rgba(239, 68, 68, 0.06); display: inline-block; padding: 4px 12px; border-radius: 6px">
                                                        ⏱️ Expires in 5 minutes
                                                    </p>
                                                </td>
                                            </tr>

                                            <!-- Security Footnote -->
                                            <tr>
                                                <td align="center" style="padding-top: 24px;">
                                                    <p style=" margin: 0;font-size: 12px;color: #71717a;line-height: 1.6;">
                                                        If you did not request this modification, you can safely ignore this security notice. Someone might have typed your address by mistake.
                                                    </p>
                                                </td>
                                            </tr>

                                        </table>

                                        <!-- Outer App Subtle Branding Footer -->
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 460px; margin-top: 20px;">
                                            <tr>
                                                <td
                                                    align="center"
                                                    style="padding-top: 24px;border-top: 1px solid rgba(255,255,255,0.06);"
                                                >
                                                    <p
                                                        style="margin: 0 0 10px 0;font-size: 12px;line-height: 1.7;color: #71717a;"
                                                    >
                                                        ⚠️ <strong>Security Notice:</strong> This is an automated email.
                                                        Please <strong>do not reply</strong> directly to this message, as
                                                        replies are not monitored.
                                                    </p>

                                                    <p
                                                        style="margin: 0;font-size: 12px;line-height: 1.7;color: #71717a;"
                                                    >
                                                        🔒 For your security, never share this verification code, reset link,
                                                        or account access details with anyone. Vingo administrators will
                                                        never ask for your password or OTP.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>
                        </body>
                </html>
            ,
       ` });

        console.log("OTP Email Sent:", info.messageId);

        return true;
    } catch (error) {
        console.log("Email Error:", error.message);
        return false;
    }
};