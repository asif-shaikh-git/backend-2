import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const emailProvider = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465, // gmail by default port is 465
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendEmail = async ({ receiverEmail, subject, body }) => {
  try {
    const receiver = {
      from: process.env.EMAIL,
      to: receiverEmail,
      subject: subject,
      html: body,
    };

    await emailProvider.verify((error, success) => {
      if (error) {
        console.log("Email transpoter error:", error);
      } else {
        console.log("Server is ready to take our messages.");
      }
    });

    await emailProvider.sendMail(receiver);
  } catch (error) {
    throw new ApiError(500, "Failed to send email");
  }
};
