const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("The Touristics is running");
});

app.listen(port, () => {
  console.log("The Server Is Running On Port", port);
});
