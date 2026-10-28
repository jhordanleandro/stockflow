const prisma = require("../config/prisma");
const { sendServerError } = require("../utils/errors");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            barcode,
            description,
            quantity,
            category,
            expirationDate,
            imageUrl
        } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                barcode,
                description,
                quantity,
                category,
                expirationDate: expirationDate
                    ? new Date(expirationDate)
                    : null,
                imageUrl
            }
        });

        res.status(201).json(product);

    } catch (error) {

        if (error.code === "P2002") {
            return res.status(400).json({
                message: "Já existe um produto com este código de barras"
            });
        }

        sendServerError(res, error);
    }
};

const getProducts = async (req, res) => {
    try {

        const products = await prisma.product.findMany();

        res.json(products);

    } catch (error) {
        sendServerError(res, error);
    }
};

const getProductById = async (req, res) => {
    try {

        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "Produto não encontrado"
            });
        }

        res.json(product);

    } catch (error) {
        sendServerError(res, error);
    }
};

const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            name,
            barcode,
            description,
            quantity,
            category,
            expirationDate,
            imageUrl
        } = req.body;

        // Só os campos editáveis: id e datas de controle não podem ser alterados
        const data = {
            name,
            barcode,
            description,
            quantity,
            category,
            imageUrl
        };

        if (expirationDate !== undefined) {
            data.expirationDate = expirationDate
                ? new Date(expirationDate)
                : null;
        }

        const product = await prisma.product.update({
            where: {
                id: Number(id)
            },
            data
        });

        res.json(product);

    } catch (error) {

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Produto não encontrado"
            });
        }

        if (error.code === "P2002") {
            return res.status(400).json({
                message: "Já existe um produto com este código de barras"
            });
        }

        sendServerError(res, error);
    }
};

const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        // Remove junto as associações com fornecedores
        await prisma.$transaction([
            prisma.productSupplier.deleteMany({
                where: {
                    productId: Number(id)
                }
            }),
            prisma.product.delete({
                where: {
                    id: Number(id)
                }
            })
        ]);

        res.json({
            message: "Produto removido com sucesso"
        });

    } catch (error) {

        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Produto não encontrado"
            });
        }

        sendServerError(res, error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};