const axios = require("axios");

// Pengujian Safe: dua pembeli memesan stok terakhir secara bersamaan.
async function testSafeOrder() {
    const requests = [
        {
            buyer: "Pembeli A",
            url: "http://localhost:3001/orders/safe",
            data: {
                buyerName: "Pembeli A",
                productId: 1,
                quantity: 1
            }
        },
        {
            buyer: "Pembeli B",
            url: "http://localhost:3002/orders/safe",
            data: {
                buyerName: "Pembeli B",
                productId: 1,
                quantity: 1
            }
        }
    ];

    console.log("=== PENGUJIAN SAFE ===");
    console.log("Mengirim dua request hampir bersamaan...\n");

    const results = await Promise.allSettled(
        requests.map(request =>
            axios.post(request.url, request.data)
        )
    );

    results.forEach((result, index) => {
        const buyer = requests[index].buyer;

        console.log(`${buyer}:`);

        if (result.status === "fulfilled") {
            console.log("HTTP Status:", result.value.status);
            console.log("Response:", result.value.data);
        } else {
            if (result.reason.response) {
                console.log(
                    "HTTP Status:",
                    result.reason.response.status
                );
                console.log(
                    "Response:",
                    result.reason.response.data
                );
            } else {
                console.log(
                    "Request Error:",
                    result.reason.message
                );
            }
        }

        console.log("-----------------------------------");
    });

    console.log("\n=== PEMERIKSAAN DATABASE ===");
    console.log("Periksa melalui pgAdmin:");
    console.log("1. Stok produk tersisa 0.");
    console.log("2. Hanya satu pesanan SUCCESS tersimpan.");
}

testSafeOrder().catch(error => {
    console.error(
        "Terjadi kesalahan:",
        error.message
    );
});