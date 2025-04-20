import express from "express";
import {
  placeOrder,
  modifyOrder,
  confirmOrder,
  updateOrderStatus,
  updatePlacedOrder,
  getOrderStatus,
  getOrdersReadyForDelivery

} from "../controllers/orderController.js";

const router = express.Router();

router.post("/orders", placeOrder); //this is the POST request to place an order

router.put("/orders/:id", modifyOrder); //this is the PUT request to modify an order

router.patch("/orders/:id/confirm", confirmOrder); //THIS IS THE PATCH REQUEST TO CONFIRM AN ORDER

router.get("/orders/:id/status", getOrderStatus); // this is the GET request to get the order status

router.patch("/orders/:id/status", updateOrderStatus); // this is the PATCH request to update the order status

router.patch("/orders/:id/placed", updatePlacedOrder); // this is the PATCH request to update the order status to placed

router.get("/orders/ready-for-delivery", getOrdersReadyForDelivery); //this is the GET request to get all orders ready for delivery



export default router;
