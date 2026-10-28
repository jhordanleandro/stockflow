const { Prisma } = require("@prisma/client");

// Erro não tratado no controller: responde sem expor detalhes internos do Prisma
const sendServerError = (res, error) => {
    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            message: "Dados inválidos"
        });
    }

    console.error(error);

    return res.status(500).json({
        message: "Erro interno do servidor"
    });
};

module.exports = {
    sendServerError
};
