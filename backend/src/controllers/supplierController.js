const prisma = require('../config/prisma');

const createSupplier = async (req, res) => {
    try {
        const {
            companyName,
            cnpj,
            address,
            phone,
            email,
            contactPerson
        } = req.body;

        const supplierExists = await prisma.supplier.findUnique({
            where: {
                cnpj
            }
        });

        if (supplierExists) {
            return res.status(400).json({
                message: 'Fornecedor com este CNPJ já cadastrado'
            });
        }

        const supplier = await prisma.supplier.create({
            data: {
                companyName,
                cnpj,
                address,
                phone,
                email,
                contactPerson
            }
        });

        return res.status(201).json(supplier);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany();

        return res.json(suppliers);
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    createSupplier,
    getSuppliers
};