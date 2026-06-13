const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const {
    getSuppliersByProduct
} = require("../controllers/productSupplierController");

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id/suppliers", getSuppliersByProduct);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
