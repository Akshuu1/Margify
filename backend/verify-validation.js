const { planRoute } = require("./src/controllers/routePlannerController");

const run = async () => {
    console.log("=== Testing Input Validation ===");

    const req = {
        body: {
            from: { name: "Rishihood" }, // Missing lat/lng
            to: { lat: 28.5, lng: 77.3 }
        }
    };

    const res = {
        statusCode: 200,
        status: function (code) {
            this.statusCode = code;
            return this;
        },
        json: function (data) {
            console.log(`Response Code: ${this.statusCode}`);
            console.log(`Response Body:`, data);
        }
    };

    try {
        await planRoute(req, res);
    } catch (e) {
        console.error("Controller crashed:", e);
    }
};

run();
