const express = require("express");
const cors = require("cors");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productRoutes");
const productSupplierRoutes = require("./routes/productSupplierRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        project: "StockFlow API",
        version: "1.0.0",
        status: "running"
    });
});

app.use("/suppliers", supplierRoutes);
app.use("/products", productRoutes);
app.use("/product-suppliers", productSupplierRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
