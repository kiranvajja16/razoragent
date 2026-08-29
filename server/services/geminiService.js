const { GoogleGenAI } = require("@google/genai");
const { searchProducts } = require("../tools/productTool");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const tools = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description:
          "Search the product catalog for products matching the customer's requirements.",
        parameters: {
          type: "OBJECT",
          properties: {
            search: {
              type: "STRING",
              description: "Product name or keyword to search for.",
            },
            category: {
              type: "STRING",
              description:
                "Product category such as Gaming, Electronics, Fitness, or Accessories.",
            },
            maxPrice: {
              type: "NUMBER",
              description:
                "Maximum price the customer is willing to pay.",
            },
          },
        },
      },
    ],
  },
];

async function askGemini(message) {
  // 1. Ask Gemini
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: message,
    config: {
      tools,
    },
  });

  console.log(
    "Gemini response:",
    JSON.stringify(response, null, 2)
  );

  // 2. Check if Gemini wants to use a tool
  const functionCalls = response.functionCalls;

  if (!functionCalls || functionCalls.length === 0) {
    return response.text;
  }

  const functionCall = functionCalls[0];

  console.log("Tool requested:", functionCall.name);
  console.log("Tool arguments:", functionCall.args);

  // 3. Execute our tool
  let toolResult;

  if (functionCall.name === "searchProducts") {
    toolResult = await searchProducts(functionCall.args);
  } else {
    throw new Error(`Unknown tool: ${functionCall.name}`);
  }

  console.log("Tool result:", toolResult);

  // 4. Send the ORIGINAL model response back,
  // preserving Gemini's thought signature.
  const secondResponse = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: [
      {
        role: "user",
        parts: [
          {
            text: message,
          },
        ],
      },

      // IMPORTANT:
      // Preserve the original response content.
      response.candidates[0].content,

      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: functionCall.name,
              response: {
                products: toolResult,
              },
            },
          },
        ],
      },
    ],

    config: {
      tools,
    },
  });

  return secondResponse.text;
}

module.exports = {
  askGemini,
};