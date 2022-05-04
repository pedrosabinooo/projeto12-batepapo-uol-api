import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";
dotenv.config();

const app = express();
app.use(cors());
app.use(json());
dayjs().format();

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);
const promise = mongoClient.connect();
promise.then(() => (db = mongoClient.db("projeto12-batepapo-uol-api")));


// POST /participants
app.post("/participants", (req, res) => {
  const participant = { ...req.body, lastStatus: Date.now() };
  const message = {
    from: req.body.name,
    to: "Todos",
    text: "entra na sala...",
    type: "status",
    time: dayjs(participant.lastStatus).format("HH:mm:ss"),
  };
  // TODO: Usar biblioteca joi
  // impedir cadastro de nome já existente (erro 409)
  if (!req.body.name) {
    res.sendStatus(422).send("Todos os campos são obrigatórios!");
    return;
  }

  const promiseP = db.collection("participants").insertOne(participant);
  promiseP.then(() => res.sendStatus(201));
  promiseP.catch((e) => res.sendStatus(500));

  const promiseM = db.collection("messages").insertOne(message);
  promiseM.then(() => res.sendStatus(201));
  promiseM.catch((e) => res.sendStatus(500));
});

// GET /participants
app.get("/participants", (req, res) => {
  const promise = db.collection("participants").find().toArray();
  promise.then((p) => {
    res.sendStatus(201)
    console.log(p)
  });
  promise.catch((e) => res.sendStatus(500));
});

// POST /messages
app.post("/messages", (req, res) => {
  const message = {
    ...req.body,
    time: dayjs(Date.now()).format("HH:mm:ss"),
    from: req.headers.User,
  };
  // TODO: Usar biblioteca joi (erro 422)
  // to e text devem ser strings não vazias
  // type só pode ser 'message' ou 'private_message'
  // from deve ser um participante existente na lista de participantes
  if (!req.body.name) {
    res.sendStatus(422).send("Todos os campos são obrigatórios!");
    return;
  }

  const promise = db.collection("messages").insertOne(message);
  promise.then(() => res.sendStatus(201));
  promise.catch((e) => res.sendStatus(500));
});

// GET /messages
app.get("/messages", (req, res) => {
  const promise = db.collection("messages").find({from: req.headers.User}).toArray();
  promise.then((m) => {
    res.sendStatus(201)
    console.log(m)
  });
  promise.catch((e) => res.sendStatus(500));
});

// TODO: POST /status
app.post("/status", (req, res) => {
  const participant = req.headers.User;
  
  const promise = db.collection("participants").find({name: participant}).toArray();
  promise.then((p) => {
    if (!p.name) {
      res.sendStatus(404);
      return;
    } else {

      res.sendStatus(200)
      return;
    }
  });
  promise.catch((e) => res.sendStatus(500));
});

app.listen(5000, () => {
  console.log("Running on http://localhost:5000");
});
