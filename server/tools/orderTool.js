const Cart = require("../models/Cart");
const Order = require("../models/Order");

async function createOrder(userId) {
  const cart = await Cart.findOne({ userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const items = cart.items.map((item) => {
    const price = item.product.price;
    const quantity = item.quantity;

    return {
      product: item.product._id,
      name: item.product.name,
      price,
      quantity,
      subtotal: price * quantity,
    };
  });

  const total = items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const order = await Order.create({
    userId,
    items,
    total,
    currency: "INR",
    status: "pending",
  });

  return order;
}

module.exports = {
  createOrder,
};