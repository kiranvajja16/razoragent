const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function addToCart({ userId, productId, quantity = 1 }) {
  // Find product
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  // Check stock
  if (product.stock < quantity) {
    throw new Error("Not enough stock available");
  }

  // Find user's cart
  let cart = await Cart.findOne({ userId });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = new Cart({
      userId,
      items: [],
    });
  }

  // Check if product already exists
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
    });
  }

  await cart.save();

  return await cart.populate("items.product");
}

async function getCart(userId) {
  const cart = await Cart.findOne({ userId }).populate("items.product");

  if (!cart) {
    return {
      userId,
      items: [],
    };
  }

  return cart;
}

module.exports = {
  addToCart,
  getCart,
};