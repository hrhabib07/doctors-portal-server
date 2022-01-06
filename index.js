const express = require("express");
const app = express();
const admin = require("firebase-admin");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");

const serviceAccount = require("./doctors-portal-main-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json()); // it will help to read the json data

require("dotenv").config();

const uri = `mongodb+srv://developer:${process.env.DB_PASS}@cluster0.lqoy5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decodedUser = await admin.auth().verifyToken(token);
      req.decodedEmail = decodedUser.email;
    } catch {}
  }
  next();
}

async function run() {
  try {
    await client.connect();
    const database = client.db("doctors_portal_main");
    const appointmentsCollection = database.collection("appointments");
    const usersCollection = database.collection("users");

    // get appointments collection
    app.get("/appointments", async (req, res) => {
      const email = req.query.email;
      const date = req.query.date;

      const query = { email: email, date: date };

      const cursor = appointmentsCollection.find(query);
      const appointments = await cursor.toArray();
      res.json(appointments);
      console.log(appointments);
    });

    // get user collection
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // post new appointment
    app.post("/appointments", async (req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.json(result);
    });

    // post new user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // put(update) new user for google signIn
    app.put("/users", async (req, res) => {
      const user = req.body;
      filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    // put(update) new admin
    app.put("/users/admin", verifyToken, async (req, res) => {
      const user = req.body;
      console.log("put", req.decodedEmail);
      filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

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

/*
    // get full collection  of appointments

    app.get("/appointments", async (req, res) => {
      const cursor = appointmentsCollection.find({});
      const appointments = await cursor.toArray();
      console.log(appointments);
      res.json(appointments);
    }); 
    
    */

/* // get appointment
    app.get("/appointments", async (req, res) => {
      const email = req.query.email;
      const date = new Date(req.query.date).toLocaleDateString();
      const query = { email: email, date: date };
      const cursor = appointmentsCollection.find(query);
      const appointments = await cursor.toArray();
      console.log(appointments);
      res.json(appointments);
    });
     */
