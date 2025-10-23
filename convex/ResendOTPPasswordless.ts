import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

const resendClient = new ResendAPI(process.env.AUTH_RESEND_KEY!);

export default Resend({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY,
    from: "Pickle <onboarding@jpickle.win>",
    async sendVerificationRequest({ identifier: email, provider, token }: any) {
        // The URL that users click in their email - goes to the verify page
        // Must be HTTPS for email clients to make it clickable
        // The web page will then redirect to pickle:// deep link
        const baseUrl = provider.server ?? process.env.SITE_URL ?? "https://jpickle.win";
        const url = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

        const { error } = await resendClient.emails.send({
            from: provider.from ?? "Pickle <onboarding@jpickle.win>",
            to: [email],
            subject: "Sign in to Pickle 🎾",
            html: getEmailTemplate(url),
        });

        if (error) {
            console.error("Error sending email:", error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    },
});

function getEmailTemplate(url: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in to Pickle</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header with Pickle branding -->
              <tr>
                <td style="background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold;">
                    🎾 Pickle
                  </h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                    Your pickleball companion
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                    Sign in to Pickle
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
                    Click the button below to sign in to your account. This link will expire in 15 minutes.
                  </p>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${url}" style="display: inline-block; background-color: #a3e635; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(132, 204, 22, 0.3);">
                          Sign In to Pickle
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                    If you didn't request this email, you can safely ignore it.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                    This email was sent by Pickle. If you have any questions, reply to this email.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

