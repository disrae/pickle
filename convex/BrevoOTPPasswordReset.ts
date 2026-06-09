import Resend from "@auth/core/providers/resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

const DEFAULT_FROM = "WePickle <noreply@wepickle.win>";

function buildPasswordResetEmail(token: string) {
    const textContent = [
        "Reset your WePickle password",
        "",
        `Your code: ${token}`,
        "",
        "Enter this code in the app to choose a new password.",
        "It expires shortly.",
        "",
        "If you didn't request this, you can ignore this email.",
    ].join("\n");

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset your WePickle password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border-radius:20px;border:1px solid #e2e4db;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#3f7d20 0%,#5fa82e 100%);padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:#fafaf7;letter-spacing:-0.02em;">WePickle</p>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(250,250,247,0.85);">Your court. Your crew. Your game.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#12170f;">Reset your password</p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#6b7560;">
                Use this code in the app to choose a new password.
              </p>
              <div style="text-align:center;margin:0 0 24px;">
                <span style="display:inline-block;padding:16px 28px;border-radius:16px;background-color:#e8f3dc;border:1px solid #c8ddb0;font-size:36px;font-weight:700;letter-spacing:0.35em;color:#3f7d20;">${token}</span>
              </div>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#6b7560;">
                This code expires shortly. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#9aa68c;text-align:center;">
                WePickle · wepickle.win
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { textContent, htmlContent };
}

export const BrevoOTPPasswordReset = Resend({
    id: "brevo-otp",
    apiKey: process.env.BREVO_API_KEY,
    from: process.env.BREVO_FROM ?? DEFAULT_FROM,
    async generateVerificationToken() {
        const random: RandomReader = {
            read(bytes) {
                crypto.getRandomValues(bytes as Uint8Array<ArrayBuffer>);
            },
        };

        const alphabet = "0123456789";
        const length = 4;
        return generateRandomString(random, alphabet, length);
    },
    async sendVerificationRequest({ identifier: email, provider, token }) {
        const apiKey = provider.apiKey ?? process.env.BREVO_API_KEY;
        if (!apiKey) {
            throw new Error("BREVO_API_KEY is not configured");
        }

        const from = provider.from ?? process.env.BREVO_FROM ?? DEFAULT_FROM;
        const match = from.match(/^(.*)<([^>]+)>$/);
        const senderName = match?.[1]?.trim() ?? "WePickle";
        const senderEmail = match?.[2]?.trim() ?? "noreply@wepickle.win";

        const { textContent, htmlContent } = buildPasswordResetEmail(token);

        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email }],
                subject: "Your WePickle password reset code",
                textContent,
                htmlContent,
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error("Brevo password reset error:", body);
            throw new Error(`Could not send password reset email: ${body}`);
        }
    },
});
