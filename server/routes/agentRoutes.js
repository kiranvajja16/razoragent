const express = require("express");
const { searchProducts } = require("../tools/productTool");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Please provide a message",
      });
    }

    console.log("User message:", message);

    // Temporary manual tool call
    const products = await searchProducts({
      search: "gaming",
      maxPrice: 3000,
    });

    res.json({
      reply: "I found products matching your request.",
      products,
    });
  } catch (error) {
    console.error("Agent error:", error);

    res.status(500).json({
      message: "Agent failed",
      error: error.message,
    });
  }
});

module.exports = router;