const prisma = require("../config/prisma");

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

const createProductSupplier = async (req, res) => {
    try {
        const { productId, supplierId } = req.body;

        if (!isValidId(productId) || !isValidId(supplierId)) {
            return res.status(400).json({
                message: "productId e supplierId são obrigatórios e devem ser números válidos"
            });
        }

        const productSupplier = await prisma.productSupplier.create({
            data: {
                productId: Number(productId),
                supplierId: Number(supplierId)
            },
            include: {
                product: true,
                supplier: true
            }
        });

        return res.status(201).json(productSupplier);

    } catch (error) {

        if (error.code === "P2002") {
            return res.status(400).json({
                message: "Este fornecedor já está associado a este produto"
            });
        }

        if (error.code === "P2003") {
            return res.status(400).json({
                message: "Produto ou fornecedor não encontrado"
            });
        }

        return res.status(500).json(error);
    }
};

const deleteProductSupplier = async (req, res) => {
    try {
        const { productId, supplierId } = req.body;

        if (!isValidId(productId) || !isValidId(supplierId)) {
            return res.status(400).json({
                message: "productId e supplierId são obrigatórios e devem ser números válidos"
            });
        }

        await prisma.productSupplier.delete({
            where: {
                productId_supplierId: {
                    productId: Number(productId),
                    supplierId: Number(supplierId)
                }
            }
        });

        return res.json({
            message: "Associação removida com sucesso"
        });

    } catch (error) {

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Associação não encontrada"
            });
        }

        return res.status(500).json(error);
    }
};

const getSuppliersByProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "ID do produto inválido"
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                suppliers: {
                    include: {
                        supplier: true
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "Produto não encontrado"
            });
        }

        const suppliers = product.suppliers.map((productSupplier) => productSupplier.supplier);

        return res.json(suppliers);

    } catch (error) {
        return res.status(500).json(error);
    }
};

const getProductsBySupplier = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "ID do fornecedor inválido"
            });
        }

        const supplier = await prisma.supplier.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!supplier) {
            return res.status(404).json({
                message: "Fornecedor não encontrado"
            });
        }

        const products = supplier.products.map((productSupplier) => productSupplier.product);

        return res.json(products);

    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = {
    createProductSupplier,
    deleteProductSupplier,
    getSuppliersByProduct,
    getProductsBySupplier
};
