const express = require("express");
const router = express.Router();

const {
    createUnsafeOrder,
    createSafeOrder
} = require("../services/orderService");

router.post("/unsafe", async (req, res) => {
    try {
        const { buyerName, productId, quantity } = req.body;

        const result = await createUnsafeOrder(
            buyerName,
            productId,
            quantity
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/safe", async (req, res) => {
    try {
        const { buyerName, productId, quantity } = req.body;

        const result = await createSafeOrder(
            buyerName,
            productId,
            quantity
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;