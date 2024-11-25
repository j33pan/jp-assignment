const express = require("express");
const cors = require("cors");

const {
  getRichieRichResponse,
  getRichieRichStreamingResponse,
} = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");

const PORT = 8081;
const app = express();

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const requestPrompt = req.body.prompt;
  // const response = await getRichieRichResponse(requestPrompt);
  // const responseHTML = RRML2HTML(response);
  // res.send(responseHTML);

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Cconnection", "keep-alive");

  try {
    // Stream RichieRich responses via SSE
    await getRichieRichStreamingResponse(
      requestPrompt,
      (data) => {
        // Convert RRML to HTML incrementally
        const htmlChunk = RRML2HTML(data);
        res.write(`data: ${htmlChunk}\n\n`); // Send each chunk to the client
      },
      () => {
        res.write("data: [DONE]\n\n"); // Signal the end of the stream
        res.end();
      }
    );
  } catch (error) {
    console.error("Error in streaming:", error);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
