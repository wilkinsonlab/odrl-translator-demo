import express from "express";
import cors from "cors";
import Handlebars from "handlebars";

Handlebars.registerPartial(
  "actions",
  `{{#if actions}}
{{#each actions}}
   <p>{{ sentence }}</p>

  {{#if refinements}}
      <h3>Action refinements</h3>
      {{#each refinements}}
          <p>{{ this }}</p>
      {{/each}}
  {{/if}}
{{/each}}
{{/if}}`
);

Handlebars.registerPartial(
  "constraints",
  `{{#if constraints}}
<h3>Constraints</h3>

{{#each constraints}}
  <p>{{ this }}</p>
{{/each}}
{{/if}}`
);

Handlebars.registerPartial(
  "consequences",
  `{{#if consequences}}
<h3>Consequences</h3>

{{#each consequences}}
  <p>{{ this }}</p>
{{/each}}
{{/if}}`
);

const template = `{{#policies}}
<strong>Description: {{ description }}</strong>

 <h1>Permissions</h1>
{{#each permissions}}
    <strong>Term: {{ cce }}</strong>
    {{> actions}}

    {{> constraints}}

   {{#if duties}}
       <h2>Duties</h2>

       {{#each duties}}
         {{> actions}}

         {{> constraints}}

         {{> consequences}}
       {{/each}}
    {{/if}}
{{/each}}

 <h1>Prohibitions</h1>
{{#each prohibitions}}
    <strong>Term: {{ cce }}</strong>
    {{> actions}}

    {{> constraints}}

   {{#if remedies}}
       <h2>Remedies</h2>

       {{#each remedies}}
         {{> actions}}

         {{> constraints}}

         {{> consequences}}
       {{/each}}
    {{/if}}
{{/each}}

  <h1>Obligations</h1>
{{#each obligations}}
    <strong>Term: {{ cce }}</strong>
    {{> actions}}

    {{> constraints}}

   {{> consequences}}
{{/each}}
{{/policies}}`;

//@ts-ignore
import Node from "xmldom/lib/dom.js";

import parsePolicy from "./src/parse_policy.js";

globalThis.Node = Node.Node;

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.query({}));
app.use(express.json());

app.post("/translate", async (req, res) => {
  const response = await parsePolicy(req.body.policy, req.body.language);
  res.send({ policies: response });
});

app.get("/translate", async (req, res) => {
  const uri = req.query.uri as string;

  if (uri) {
    const policy = await fetch(new URL(uri));
    const graph = await policy.text();

    const response = await parsePolicy(graph);
    res.send(Handlebars.compile(template)({ policies: response }));
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
