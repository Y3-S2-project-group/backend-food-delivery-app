import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateOrderPDF = (order, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure the temp directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Add title
      doc.fontSize(20).text("Order Details", { align: "center" });
      doc.moveDown();

      // Add customer info
      doc.fontSize(14).text(`Customer Name: ${order.customerInfo.name}`);
      doc.text(`Customer Email: ${order.customerInfo.email}`);
      doc.text(`Contact Number: ${order.customerInfo.contactNumber}`);
      doc.text(`Restaurant Name: ${order.restaurantName}`);
      doc.moveDown();

      // Add order details
      doc.text(`Order ID: ${order._id}`);
      doc.text(`Order Status: ${order.status}`);
      doc.text(`Payment Status: ${order.paymentStatus}`);
      doc.moveDown();

      // Draw table header
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Item Name", 50, doc.y, { continued: true });
      doc.text("Quantity", 200, doc.y, { continued: true });
      doc.text("Price", 300, doc.y, { continued: true });
      doc.text("Total", 400, doc.y);
      doc.moveDown();
      doc.text("-------------------------------------------------------------");
      doc.moveDown();

      // Add table rows
      doc.font("Helvetica");
      order.items.forEach((item) => {
        const total = item.quantity * item.price;
        doc.text(item.name, 50, doc.y, { continued: true });
        doc.text(item.quantity.toString(), 200, doc.y, { continued: true });
        doc.text(`$${item.price.toFixed(2)}`, 300, doc.y, { continued: true });
        doc.text(`$${total.toFixed(2)}`, 400, doc.y);
        doc.moveDown();
      });

      // Add total amount
      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").text(`Total Amount: $${order.totalAmount.toFixed(2)}`, { align: "right" });

      // Finalize the PDF
      doc.end();

      stream.on("finish", () => resolve());
      stream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};