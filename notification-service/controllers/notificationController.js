import fs from "fs";

import { sendEmailWithAttachment } from "../utils/emailUtils.js";
import { generateOrderPDF } from "../utils/pdfUtils.js";
import path from "path";

export const sendNotification = async (req, res) => {
  try {
    const { to, subject, message, order } = req.body;

    if (!to || !subject || !message || !order) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: to, subject, message, or order",
      });
    }

    // Generate PDF
    const pdfPath = path.join("temp", `order_${order._id}.pdf`);
    await generateOrderPDF(order, pdfPath);

    // Send email with PDF attachment
    await sendEmailWithAttachment(
      to,
      subject,
      `${message}\n\nRestaurant: ${order.restaurantName}`, // Include restaurant name in the email body
      pdfPath
    );

    // Clean up the generated PDF
    fs.unlinkSync(pdfPath);

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully with PDF attachment",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};
