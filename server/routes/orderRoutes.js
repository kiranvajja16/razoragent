const express = require("express");
const { createOrder } = require("../tools/orderTool");
const { createPaymentOrder } = require("../tools/paymentTool");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const order = await createOrder(userId);

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);

    res.status(400).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
});

router.post("/:orderId/payment", async (req, res) => {
  try {
    const { orderId } = req.params;

    const paymentOrder = await createPaymentOrder(orderId);

    res.status(201).json(paymentOrder);
  } catch (error) {
    console.error("Payment order error:", error);

    res.status(400).json({
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
});

module.exports = router;