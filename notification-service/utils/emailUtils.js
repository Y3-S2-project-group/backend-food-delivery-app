import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmailWithAttachment = async (to, subject, text, attachmentPath) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: [
        {
          filename: "OrderDetails.pdf",
          path: attachmentPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with attachment`);
  } catch (error) {
    console.error("Error sending email with attachment:", error);
    throw error;
  }
};