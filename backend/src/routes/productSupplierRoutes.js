const express = require("express");

const {
    createProductSupplier,
    deleteProductSupplier
} = require("../controllers/productSupplierController");

const router = express.Router();

router.post("/", createProductSupplier);
router.delete("/", deleteProductSupplier);

module.exports = router;
