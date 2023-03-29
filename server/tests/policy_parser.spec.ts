import { test } from "@japa/runner";

import parsePolicy from "../src/parse_policy.js";

const policy = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
@prefix v: <http://rdf.data-vocabulary.org/#> .
@prefix odrl: <http://www.w3.org/ns/odrl/2/> .
@prefix occe: <https://w3id.org/occe/> .
@prefix dpv: <https://w3id.org/dpv#> .
@prefix obo: <http://purl.obolibrary.org/obo/> .
@prefix dbo: <http://dbpedia.org/resource/> .
@prefix this: <https://example.com/> .

this:620694909 rdf:type odrl:Offer ;
	this:id "620694909" ;
	odrl:permission <https://example.com/620694909/rule> .

this:6026049808 rdf:type odrl:Offer ;
	this:id "6026049808" ;
	odrl:permission <https://example.com/6026049808/rule> .

<https://example.com/620694909/rule> odrl:target this:asset_1 ;
	odrl:assigner this:Data_Center_1 ;
	odrl:action odrl:use ;
	odrl:constraint <https://example.com/620694909/rule_constraint> .

<https://example.com/6026049808/rule> odrl:target this:asset_2 ;
	odrl:assigner this:Data_Center_2 ;
	odrl:action odrl:sell ;
	odrl:constraint <https://example.com/6026049808/rule_constraint> .

<https://example.com/620694909/rule_constraint> odrl:leftOperand dpv:hasJustification ;
	odrl:operator odrl:isA ;
	odrl:rightOperand obo:NCIT_C70800 .

<https://example.com/6026049808/rule_constraint> odrl:leftOperand dpv:hasJustification ;
	odrl:operator odrl:isA ;
	odrl:rightOperand obo:NCIT_C70800 .`;

const policy2 = `{
  "@context": "https://www.w3.org/ns/odrl.jsonld",
  "@type": "Policy",
  "uid": "http://example.com/policy_0001",
  "profile": "https://gist.githubusercontent.com/Melchyore/0716b1bfbbd8c55bd69d7a35023a2c28/raw/afeb37b11b434d3552d134809f4ef3e7ccfc5146/odrl-cce.ttl",
  "permission": [{
      "target": "http://example.com/asset:1212",
      "action": "odrl:use",
      "assigner": "http://example.com/owner:181",
      "assignee": "http://example.com/Biobank",
      "constraint": [
        {
          "leftOperand": "odrl:delayPeriod",
          "operator": "odrl:gt",
          "rightOperand": { "@value": "P1Y2M3DT5H20M30.123S", "@type": "xsd:duration" }
        }
      ]
  }]
}`;

test.group("Policy parser", () => {
  test("should parse RDF/Turtle ODRL policy", async ({ assert }) => {
    const parsedPolicies = await parsePolicy(policy);

    console.dir(parsedPolicies, { depth: null });

    assert.lengthOf(parsedPolicies, 2);
    assert.lengthOf(parsedPolicies[0].permissions, 1);
    assert.lengthOf(parsedPolicies[1].permissions, 1);
  }).disableTimeout();

  test("should parse JSON-LD ODRL policy", async ({ assert }) => {
    const parsedPolicies = await parsePolicy(policy2);

    console.dir(parsedPolicies, { depth: null });

    assert.lengthOf(parsedPolicies, 1);
    assert.lengthOf(parsedPolicies[0].permissions, 1);
  }).disableTimeout();
});
