require("dotenv").config();

const express = require("express");
const pool = require("./db");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("E-Commerce Data Consistency Service");
});

app.get("/products", async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM products ORDER BY id"
    );

    res.json(result.rows);
});

app.get("/orders", async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM orders ORDER BY id"
    );

    res.json(result.rows);
});

app.use("/orders", orderRoutes);

app.listen(PORT, () => {
    console.log(`Order Service berjalan di port ${PORT}`);
});