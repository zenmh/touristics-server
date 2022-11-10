const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("The Touristics is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6dotpwg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const run = async () => {
  try {
    const serviceCollection = client.db("touristics").collection("services");
    const reviewCollection = client.db("touristics").collection("reviews");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ _id: -1 });
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });

    app.get("/allServices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const allServices = await cursor.toArray();
      res.send(allServices);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.get("/myreviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log("decoded", decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = reviewCollection.find(query).sort({ _id: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = await reviewCollection.findOne(query);
      res.send(review);
    });

    app.get("/itemReviews", async (req, res) => {
      const title = req.query.title;
      const query = { title: title };
      const cursor = reviewCollection.find(query).sort({ _id: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/allServices", async (req, res) => {
      const service = req.body;
      const services = await serviceCollection.insertOne(service);
      res.send(services);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const reviews = await reviewCollection.insertOne(review);
      res.send(reviews);
    });

    app.put("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = req.body;
      // console.log(review);
      const option = { upsert: true };
      const updateReview = {
        $set: {
          service_id: review.service_id,
          email: review.email,
          userImg: review.userImg,
          Img: review.Img,
          price: review.price,
          rating: review.rating,
          name: review.name,
          title: review.title,
          opinion: review.opinion,
        },
      };
      const result = await reviewCollection.updateOne(
        query,
        updateReview,
        option
      );
      console.log(result);
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.error("Error", err));

app.listen(port, () => {
  console.log("The Server Is Running On Port", port);
});
