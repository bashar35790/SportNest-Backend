// modemon dns error
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const bookingsCollection = database.collection("Bookings");

    app.post("/add-facility", async (req, res) => {
      try {
        const facilitysData = req.body;
        console.log("Received facility data:", facilitysData);
        const result = await facilitysCollection.insertOne(facilitysData);
        res.status(201).json(result);
      } catch (error) {
        console.error("Failed to insert facility:", error);
        res.status(500).json({
          message: "Internal server error while adding facility",
          error: error.message,
        });
      }
    });

    app.get("/featured", async (req, res) => {
      try {
        const facilities = await facilitysCollection
          .find()
          .sort({ bookingCount: -1 })
          .limit(6);
        const facilitiesArray = await facilities.toArray();

        res.json({ success: true, facilities: facilitiesArray });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    app.get("/all-facility", async (req, res) => {
      const search = req.query.search;
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        };
      }
      const result = await facilitysCollection.find(query).toArray();
      res.json(result);
    });

    app.get("/all-facility/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const facilitysData = await facilitysCollection.findOne({
          _id: new ObjectId(id),
        });
        res.json(facilitysData);
      } catch (error) {
        console.error("Failed to get facili`ty :", error);
        res.status(500).json({
          message: "Internal server error while getting facility",
          error: error.message,
        });
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
