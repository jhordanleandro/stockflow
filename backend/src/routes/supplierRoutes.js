const express = require('express');

const {
    createSupplier,
    getSuppliers
} = require('../controllers/supplierController');

const router = express.Router();

router.post('/', createSupplier);
router.get('/', getSuppliers);

module.exports = router;