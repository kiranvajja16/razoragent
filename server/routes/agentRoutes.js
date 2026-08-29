const express = require("express");
const { askGemini } = require("../services/geminiService");

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

    const reply = await askGemini(message);

    res.json({
      reply,
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