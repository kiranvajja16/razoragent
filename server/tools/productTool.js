const Product = require("../models/Product");

async function searchProducts({ search, category, maxPrice }) {
  const filter = {};


  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Filter category
  if (category) {
    filter.category = {
      $regex: category,
      $options: "i",
    };
  }

  // Filter maximum price
  if (maxPrice) {
    filter.price = {
      $lte: Number(maxPrice),
    };
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(10);

  return products;
}

module.exports = {
  searchProducts,
};