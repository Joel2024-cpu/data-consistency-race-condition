const axios = require("axios");

async function testRaceCondition() {
    const requests = [
        axios.post("http://localhost:3001/orders/unsafe", {
            buyerName: "Pembeli A",
            productId: 1,
            quantity: 1
        }),

        axios.post("http://localhost:3002/orders/unsafe", {
            buyerName: "Pembeli B",
            productId: 1,
            quantity: 1
        })
    ];

    const results = await Promise.all(
        requests.map(async (request, index) => {
            try {
                const response = await request;
                console.log(`Pembeli ${index + 1}:`, response.data);
            } catch (error) {
                console.log(
                    `Pembeli ${index + 1}:`,
                    error.response?.data || error.message
                );
            }
        })
    );
}

testRaceCondition();