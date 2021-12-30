const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");

app.use(cors());
require("dotenv").config();

const uri = `mongodb+srv://developer:${process.env.DB_PASS}@cluster0.lqoy5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("database connected successfully");

    /*
    
     // CONNECT WITH DATABASE USING DATABASE NAME AND COLLECTION NAME
    const database = client.db("");
    const movies = database.collection(""); 
    
    */
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Doctors portal!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
