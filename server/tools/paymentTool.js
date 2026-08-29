const Order = require("../models/Order");
const { createRazorpayOrder } = require("../services/razorpayService");

async function createPaymentOrder(orderId) {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "pending") {
    throw new Error("Order is not pending");
  }

  if (order.razorpayOrderId) {
    return {
      message: "Razorpay order already exists",
      razorpayOrderId: order.razorpayOrderId,
      amount: order.total,
      currency: order.currency,
    };
  }

  const razorpayOrder = await createRazorpayOrder({
    amount: order.total,
    currency: order.currency,
    receipt: `rz_${order._id}`,
  });

  order.razorpayOrderId = razorpayOrder.id;

  await order.save();

  return {
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: order.total,
    currency: order.currency,
  };
}

module.exports = {
  createPaymentOrder,
};