// Testes da API: sobem o servidor com um banco SQLite temporário (o dev.db não é tocado)
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const BACKEND = path.join(__dirname, "..");
const PRISMA = path.join(BACKEND, "node_modules", ".bin", "prisma");

let tmpDir;
let server;
let baseUrl;

const freePort = () => new Promise((resolve) => {
    const probe = net.createServer().listen(0, "127.0.0.1", () => {
        const { port } = probe.address();
        probe.close(() => resolve(port));
    });
});

const api = async (method, url, body) => {
    const res = await fetch(baseUrl + url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const json = await res.json();

    // Nenhuma resposta pode expor detalhes internos do Prisma
    assert.ok(!JSON.stringify(json).includes("clientVersion"), `resposta expõe erro interno: ${JSON.stringify(json)}`);

    return { status: res.status, body: json };
};

before(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "stockflow-test-"));
    const port = await freePort();
    const env = {
        ...process.env,
        DATABASE_URL: `file:${path.join(tmpDir, "test.db")}`,
        PORT: String(port)
    };

    execFileSync(PRISMA, ["migrate", "deploy"], { cwd: BACKEND, env, stdio: "ignore" });

    server = spawn(process.execPath, ["src/server.js"], { cwd: BACKEND, env, stdio: "ignore" });
    baseUrl = `http://127.0.0.1:${port}`;

    for (let i = 0; i < 50; i++) {
        try {
            await fetch(baseUrl + "/");
            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
    throw new Error("A API não subiu");
});

after(() => {
    server?.kill();
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

const supplierData = {
    companyName: "Distribuidora Exemplo",
    cnpj: "11222333000181",
    address: "Rua A, 1",
    phone: "88900000000",
    email: "contato@exemplo.com",
    contactPerson: "Maria"
};

const productData = {
    name: "Teclado USB",
    barcode: "7890000000001",
    description: "Teclado ABNT2",
    quantity: 10,
    category: "Periféricos"
};

let supplierId;
let productId;

test("status da API", async () => {
    const { status, body } = await api("GET", "/");
    assert.equal(status, 200);
    assert.equal(body.status, "running");
});

test("cadastra fornecedor e recusa CNPJ duplicado", async () => {
    const created = await api("POST", "/suppliers", supplierData);
    assert.equal(created.status, 201);
    supplierId = created.body.id;

    const duplicate = await api("POST", "/suppliers", supplierData);
    assert.equal(duplicate.status, 400);
});

test("cadastra produto e recusa código de barras duplicado", async () => {
    const created = await api("POST", "/products", productData);
    assert.equal(created.status, 201);
    productId = created.body.id;

    const duplicate = await api("POST", "/products", productData);
    assert.equal(duplicate.status, 400);
});

test("dados incompletos ou id inválido respondem 400", async () => {
    assert.equal((await api("POST", "/products", { name: "Sem descrição" })).status, 400);
    assert.equal((await api("GET", "/products/abc")).status, 400);
});

test("registro inexistente responde 404", async () => {
    assert.equal((await api("GET", "/products/9999")).status, 404);
    assert.equal((await api("PUT", "/suppliers/9999", { phone: "1" })).status, 404);
    assert.equal((await api("DELETE", "/products/9999")).status, 404);
});

test("associa produto e fornecedor nos dois sentidos", async () => {
    const link = { productId, supplierId };
    assert.equal((await api("POST", "/product-suppliers", link)).status, 201);
    assert.equal((await api("POST", "/product-suppliers", link)).status, 400);

    const suppliers = await api("GET", `/products/${productId}/suppliers`);
    assert.deepEqual(suppliers.body.map((s) => s.id), [supplierId]);

    const products = await api("GET", `/suppliers/${supplierId}/products`);
    assert.deepEqual(products.body.map((p) => p.id), [productId]);
});

test("atualização ignora id e datas de controle", async () => {
    const before = await api("GET", `/products/${productId}`);
    const { status, body } = await api("PUT", `/products/${productId}`, {
        id: 999,
        createdAt: "2000-01-01T00:00:00Z",
        quantity: 7,
        expirationDate: "2027-12-31"
    });

    assert.equal(status, 200);
    assert.equal(body.id, productId);
    assert.equal(body.createdAt, before.body.createdAt);
    assert.equal(body.quantity, 7);
    assert.equal(body.expirationDate, "2027-12-31T00:00:00.000Z");
});

test("excluir produto associado remove também a associação", async () => {
    const removed = await api("DELETE", `/products/${productId}`);
    assert.equal(removed.status, 200);

    const products = await api("GET", `/suppliers/${supplierId}/products`);
    assert.deepEqual(products.body, []);
});

test("excluir fornecedor associado remove também a associação", async () => {
    const product = await api("POST", "/products", { ...productData, barcode: "7890000000002" });
    assert.equal((await api("POST", "/product-suppliers", { productId: product.body.id, supplierId })).status, 201);

    assert.equal((await api("DELETE", `/suppliers/${supplierId}`)).status, 200);

    const suppliers = await api("GET", `/products/${product.body.id}/suppliers`);
    assert.deepEqual(suppliers.body, []);
});
