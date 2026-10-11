
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/product");

// Helper: Validate MongoDB product ID
function validateProductId(id) {
  return mongoose.isValidObjectId(id);
}

// 1. Create Product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. Get All Products with filtering, sorting and pagination
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const allowedFields = [
      "name",
      "price",
      "quantity",
      "createdAt"
    ];

    const sortField = allowedFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOrder = order === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalProducts = await Product.countDocuments(filter);

    res.json({
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Low Stock Alert
// Keep static routes before /:id
router.get("/low-stock", async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $lte: ["$quantity", "$lowStockThreshold"]
      }
    });

    res.json({
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Category-wise Inventory Summary
router.get("/category-summary", async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalInventoryValue: {
            $sum: { $multiply: ["$price", "$quantity"] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Get Single Product by ID
router.get("/:id", async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Update Product
router.put("/:id", async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 7. Delete Product
router.delete("/:id", async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 8. Restock Product
router.patch("/:id/restock", async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const quantity = req.body.quantity;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number"
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Stock restocked successfully",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 9. Record Sale
router.patch("/:id/sale", async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const quantity = req.body.quantity;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number"
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        quantity: { $gte: quantity }
      },
      {
        $inc: { quantity: -quantity }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      const exists = await Product.exists({
        _id: req.params.id
      });

      return res.status(exists ? 400 : 404).json({
        message: exists
          ? "Insufficient stock"
          : "Product not found"
      });
    }

    res.json({
      message: "Sale recorded successfully",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
