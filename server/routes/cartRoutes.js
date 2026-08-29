const express = require("express");
const { addToCart } = require("../tools/cartTool");

const router = express.Router();

// Add product to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "userId and productId are required",
      });
    }

    const cart = await addToCart({
      userId,
      productId,
      quantity,
    });

    res.status(200).json(cart);
  } catch (error) {
    console.error("Cart error:", error);

    res.status(400).json({
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
});

module.exports = router;