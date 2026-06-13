const prisma = require("../config/prisma");

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
                message: "Fornecedor com este CNPJ já cadastrado"
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

const getSupplierById = async (req, res) => {
    try {

        const { id } = req.params;

        const supplier = await prisma.supplier.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!supplier) {
            return res.status(404).json({
                message: "Fornecedor não encontrado"
            });
        }

        return res.json(supplier);

    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateSupplier = async (req, res) => {
    try {

        const { id } = req.params;

        const supplier = await prisma.supplier.update({
            where: {
                id: Number(id)
            },
            data: req.body
        });

        return res.json(supplier);

    } catch (error) {

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Fornecedor não encontrado"
            });
        }

        if (error.code === "P2002") {
            return res.status(400).json({
                message: "CNPJ já cadastrado"
            });
        }

        return res.status(500).json(error);
    }
};

const deleteSupplier = async (req, res) => {
    try {

        const { id } = req.params;

        await prisma.supplier.delete({
            where: {
                id: Number(id)
            }
        });

        return res.json({
            message: "Fornecedor removido com sucesso"
        });

    } catch (error) {

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Fornecedor não encontrado"
            });
        }

        return res.status(500).json(error);
    }
};

module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};