const WebSocket = require("ws");
const axios = require("axios");

async function getRichieRichResponse(prompt) {
  try {
    const response = await axios.post(
      "http://localhost:8082/v1/chat/completions",
      {
        prompt,
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getRichieRichStreamingResponse(prompt, onMessage, onComplete) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("ws://localhost:8082/v1/stream");

    ws.on("open", () => {
      ws.send(prompt); // Send the user prompt to RichieRich.
    });

    ws.on("message", (data) => {
      if (data === "[DONE]") {
        ws.close();
        onComplete();
        resolve();
      } else {
        onMessage(data); // Pass the streamed response to the provided callback.
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      reject(err);
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed.");
    });
  });
}

module.exports = {
  getRichieRichResponse,
  getRichieRichStreamingResponse,
};
