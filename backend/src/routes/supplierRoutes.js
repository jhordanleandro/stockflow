const express = require("express");

const {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
} = require("../controllers/supplierController");

const {
    getProductsBySupplier
} = require("../controllers/productSupplierController");

const router = express.Router();

router.post("/", createSupplier);
router.get("/", getSuppliers);
router.get("/:id/products", getProductsBySupplier);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;
