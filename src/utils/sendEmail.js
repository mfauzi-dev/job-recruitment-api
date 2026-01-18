import {
    passwordResetRequestTemplate,
    passwordResetSuccessTemplate,
    sendWelcomeEmailTemplate,
    verificationEmailTemplate,
} from "../templates/emailTemplate.js";
import { ResponseError } from "../middleware/error.middleware.js";
import transporter from "../config/email.js"; // pakai transporter Mailtrap langsung
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const mailOptions = {
            from: `"No Reply" <${process.env.SMTP_MAIL}>`,
            to: email,
            subject: "Verify your email",
            html: verificationEmailTemplate.replace(
                "{verificationCode}",
                verificationToken
            ),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent! MessageId: ${info.messageId}`);
    } catch (error) {
        throw new ResponseError(
            401,
            `Error sending verification email: ${error}`
        );
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: `"No Reply" <${process.env.SMTP_MAIL}>`,
            to: email,
            subject: "Welcome to our company",
            html: sendWelcomeEmailTemplate.replace("{name}", name),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent! MessageId: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending welcome email`, error);
        throw new ResponseError(401, `Error sending welcome email: ${error}`);
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        const mailOptions = {
            from: `"No Reply" <${process.env.SMTP_MAIL}>`,
            to: email,
            subject: "Reset your password",
            html: passwordResetRequestTemplate.replace("{resetURL}", resetURL),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent! MessageId: ${info.messageId}`);
    } catch (error) {
        console.log(`Error sending password reset email`, error);
        throw new ResponseError(
            401,
            `Error sending password reset email: ${error}`
        );
    }
};

export const sendResetSuccessEmail = async (email) => {
    try {
        const mailOptions = {
            from: `"No Reply" <${process.env.SMTP_MAIL}>`,
            to: email,
            subject: "Password Reset Successful",
            html: passwordResetSuccessTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(
            `Password reset success email sent! MessageId: ${info.messageId}`
        );
    } catch (error) {
        console.log(`Error sending reset success email`, error);
        throw new ResponseError(
            401,
            `Error sending reset success email: ${error}`
        );
    }
};
