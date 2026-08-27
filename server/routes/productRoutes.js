const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Create a product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// Get one product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Invalid product ID",
      error: error.message,
    });
  }
});

module.exports = router;