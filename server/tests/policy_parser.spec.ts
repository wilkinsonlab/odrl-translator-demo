import { test } from "@japa/runner";

//import parsePolicy from "../src/parse_policy";

const policy = `
{
  "@context": "http://www.w3.org/ns/odrl.jsonld",
  "@type": "Set",
  "uid": "http://example.com/policy:1010",
  "permission": [{
      "target": "http://example.com/asset:9898.movie",
      "action": "use"
  }]
}
`;

test.group("Policy parser", () => {
  test("should parse ODRL policy", async ({ assert }) => {
    //@ts-ignore
    //assert.strictEqual((await parsePolicy(policy)).permissions.length, 1);
  });
});
