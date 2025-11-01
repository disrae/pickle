import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { Resend as ResendAPI } from "resend";
import { VerificationCodeEmail } from "./email";

export const ResendOTP = Email({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY,
    maxAge: 60 * 20,
    async generateVerificationToken() {
        const random: RandomReader = {
            read(bytes) {
                crypto.getRandomValues(bytes);
            },
        };
        const alphabet = "0123456789";
        const length = 8;
        return generateRandomString(random, alphabet, length);
    },
    async sendVerificationRequest({
        identifier: email,
        provider,
        token,
        expires,
    }) {
        const resend = new ResendAPI(provider.apiKey);
        const { error } = await resend.emails.send({
            from: process.env.AUTH_EMAIL ?? "WePickle <signin@wepickle.win>",
            to: [email],
            subject: `Sign in to WePickle`,
            react: VerificationCodeEmail({ code: token, expires, email }),
        });
        console.log(`https://wepickle.win/auth/verify?token=${token}&email=${email}`);
        if (error) {
            throw new Error(JSON.stringify(error));
        }
    },
});