import * as $rdf from "rdflib";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

//@ts-ignore
import Node from "xmldom/lib/dom.js";

import parsePolicy from "./src/parse_policy.js";

globalThis.Node = Node.Node;

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

app.post("/translate", async (req, res) => {
  const response = await parsePolicy(req.body.policy, req.body.language);
  console.dir(response, { depth: null });
  res.send({ policies: response });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
