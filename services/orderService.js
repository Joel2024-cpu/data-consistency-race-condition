const pool = require("../db");

// Simulasi race condition
async function createUnsafeOrder(buyerName, productId, quantity) {
    const client = await pool.connect();

    try {
        // 1. Membaca stok
        const result = await client.query(
            "SELECT stock FROM products WHERE id = $1",
            [productId]
        );

        if (result.rows.length === 0) {
            throw new Error("Produk tidak ditemukan");
        }

        const stock = result.rows[0].stock;

        // 2. Mengecek stok
        if (stock < quantity) {
            return { success: false, message: "Stok tidak cukup" };
        }
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Mengurangi stok berdasarkan hasil pembacaan sebelumnya
        await client.query(
            "UPDATE products SET stock = $1 WHERE id = $2",
            [stock - quantity, productId]
        );

        // 4. Menyimpan pesanan
        await client.query(
            `INSERT INTO orders
            (buyer_name, product_id, quantity, status)
            VALUES ($1, $2, $3, $4)`,
            [buyerName, productId, quantity, "SUCCESS"]
        );

        return { success: true, message: "Pesanan berhasil" };

    } finally {
        client.release();
    }
}

// Pemesanan dengan atomic operation dan transaction
async function createSafeOrder(buyerName, productId, quantity) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Atomic operation: stok dikurangi hanya jika mencukupi
        const result = await client.query(
            `UPDATE products
             SET stock = stock - $1
             WHERE id = $2 AND stock >= $1
             RETURNING stock`,
            [quantity, productId]
        );

        // Jika tidak ada baris yang berubah, stok tidak cukup
        if (result.rowCount === 0) {
            await client.query("ROLLBACK");

            return {
                success: false,
                message: "Stok tidak cukup atau produk tidak ditemukan"
            };
        }

        // Simpan pesanan dalam transaksi yang sama
        await client.query(
            `INSERT INTO orders
            (buyer_name, product_id, quantity, status)
            VALUES ($1, $2, $3, $4)`,
            [buyerName, productId, quantity, "SUCCESS"]
        );

        await client.query("COMMIT");

        return {
            success: true,
            message: "Pesanan berhasil",
            remainingStock: result.rows[0].stock
        };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
}

module.exports = {
    createUnsafeOrder,
    createSafeOrder
};
