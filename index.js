// modemon dns error
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();

    const database = client.db("sportnest");
    const facilitysCollection = database.collection("Facilitys");

    app.post("/add-facility", async (req, res) => {
      try {
        const facilitysData = req.body;
        console.log("Received facility data:", facilitysData);
        const result = await facilitysCollection.insertOne(facilitysData);
        res.status(201).json(result);
      } catch (error) {
        console.error("Failed to insert facility:", error);
        res.status(500).json({ message: "Internal server error while adding facility", error: error.message });
      }
    });

    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error(error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Hello Server!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
