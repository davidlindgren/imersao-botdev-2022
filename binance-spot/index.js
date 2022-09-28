const axios = require("axios");
const crypto = require("crypto");
const WebSocket = require("ws");

const ws = new WebSocket(process.env.STREAM_URL + "btcusdt@bookTicker");
let isOpened = false;

ws.onmessage = async (event) => {
    const obj = JSON.parse(event.data);
    console.log("Symbol: " + obj.s);
    console.log("Price: " + obj.a);

    const price = parseFloat(obj.p);
    if (price < 19000 && !isOpened) {
        console.log("Comprar!");
        const result = await newOrder("BTCUSDT", "0.001", "BUY");
        console.log(result);
        isOpened = true;
    }
    else if (price > 21000 && isOpened) {
        console.log("Vender!");
        const result = await newOrder("BTCUSDT", "0.001", "SELL");
        console.log(result);
        isOpened = false;
    }
}

async function newOrder(symbol, quantity, side) {
    const data = { symbol, quantity, side };
    data.type = "MARKET";
    data.timestamp = Date.now();

    const signature = crypto
        .createHmac("sha256", process.env.SECRET_KEY)
        .update(new URLSearchParams(data).toString())
        .digest("hex");

    data.signature = signature;

    const result = await axios({
        method: "POST",
        url: process.env.API_URL + "/v3/order?" + new URLSearchParams(data),
        headers: { "X-MBX-APIKEY": process.env.API_KEY }
    });
    return result.data;
}
