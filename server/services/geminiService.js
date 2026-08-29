const { GoogleGenAI } = require("@google/genai");
const { searchProducts } = require("../tools/productTool");
const {
  addToCart,
  getCart,
  calculateCartTotal,
} = require("../tools/cartTool");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const tools = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description:
          "Search the merchant product catalog for products matching the customer's requirements.",
        parameters: {
          type: "OBJECT",
          properties: {
            search: {
              type: "STRING",
              description: "Product name or keyword.",
            },
            category: {
              type: "STRING",
              description: "Product category.",
            },
            maxPrice: {
              type: "NUMBER",
              description: "Maximum price the customer is willing to pay.",
            },
          },
        },
      },
      {
        name: "addToCart",
        description:
          "Add a product to the customer's shopping cart.",
        parameters: {
          type: "OBJECT",
          properties: {
            userId: {
              type: "STRING",
              description: "Customer ID.",
            },
            productId: {
              type: "STRING",
              description: "MongoDB product ID.",
            },
            quantity: {
              type: "NUMBER",
              description: "Quantity to add.",
            },
          },
          required: ["userId", "productId", "quantity"],
        },
      },
      {
        name: "getCart",
        description:
          "Retrieve the customer's shopping cart.",
        parameters: {
          type: "OBJECT",
          properties: {
            userId: {
              type: "STRING",
              description: "Customer ID.",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "calculateCartTotal",
        description:
          "Calculate the total cost of items in the customer's shopping cart.",
        parameters: {
          type: "OBJECT",
          properties: {
            userId: {
              type: "STRING",
              description: "Customer ID.",
            },
          },
          required: ["userId"],
        },
      },
    ],
  },
];

async function askGemini(message) {
  const firstResponse = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: message,
    config: {
      tools,
    },
  });

  console.log(
    "\nFIRST RESPONSE:\n",
    JSON.stringify(firstResponse, null, 2)
  );

  const functionCalls = firstResponse.functionCalls;

  // No tool call -> normal AI answer
  if (!functionCalls || functionCalls.length === 0) {
    return firstResponse.text || "I couldn't generate a response.";
  }

  const functionResponses = [];

  // Execute all requested tools
  for (const functionCall of functionCalls) {
    console.log("\nTOOL:", functionCall.name);
    console.log("ARGS:", functionCall.args);

    let result;

    if (functionCall.name === "searchProducts") {
      result = await searchProducts(functionCall.args);
    } else if (functionCall.name === "addToCart") {
      result = await addToCart(functionCall.args);
    } else if (functionCall.name === "getCart") {
      result = await getCart(functionCall.args.userId);
    } else if (functionCall.name === "calculateCartTotal") {
      result = await calculateCartTotal(functionCall.args.userId);
    } else {
      throw new Error(`Unknown tool: ${functionCall.name}`);
    }

    console.log("RESULT:", result);

    functionResponses.push({
      functionResponse: {
        name: functionCall.name,
        response: {
          result,
        },
      },
    });
  }

  // Preserve Gemini's original response content.
  const history = [
    {
      role: "user",
      parts: [
        {
          text: message,
        },
      ],
    },
    firstResponse.candidates[0].content,
    {
      role: "user",
      parts: functionResponses,
    },
  ];

  const secondResponse = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: history,
    config: {
      tools,
    },
  });

  console.log(
    "\nSECOND RESPONSE:\n",
    JSON.stringify(secondResponse, null, 2)
  );

  return secondResponse.text || "The action was completed.";
}

module.exports = {
  askGemini,
};