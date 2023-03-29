import { test } from "@japa/runner";
import { Writer as N3Writer } from "n3";
import YarrrmlParser from "@rmlio/yarrrml-parser/lib/rml-generator.js";
import * as rocketrml from "rocketrml";
import { GREL } from "../src/namespaces.js";

const yarrrmlParse = (yaml: string) =>
  new Promise((resolve) => {
    const y2r = new YarrrmlParser();
    const yamlQuads = y2r.convert(yaml);
    let prefixes = {
      rr: "http://www.w3.org/ns/r2rml#",
      rml: "http://semweb.mmlab.be/ns/rml#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      schema: "http://schema.org/",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      fnml: "http://semweb.mmlab.be/ns/fnml#",
      fno: "http://w3id.org/function/ontology#",
      mex: "http://mapping.example.com/",
    };
    prefixes = { ...prefixes, ...y2r.getPrefixes() };

    const writer = new N3Writer({ prefixes });
    writer.addQuads(yamlQuads);
    writer.end((_: any, result: any) => {
      resolve(result);
    });
  });

test.group("RML parser", () => {
  test("should parse RML", async ({ assert }) => {
    const yarrrml = `
  prefixes:
    odrl: http://www.w3.org/ns/odrl/2/
    xsd: http://www.w3.org/2001/XMLSchema#
    rdfs: http://www.w3.org/2000/01/rdf-schema#
    rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#
    occe: https://w3id.org/occe/
    dpv: https://w3id.org/dpv#
    obo: http://purl.obolibrary.org/obo/
    this: https://example.com/

  mappings:
    policy:
      sources:
        - [input~csv]
      s: $(uid)
      po:
        - [a, $(type)~iri]
        - [odrl:uid, $(uid)~iri]
        - [odrl:profile, $(profile)~iri]
        - [odrl:permission, this:$(uniqid)_rule~iri]

    rule:
      sources:
        - [input~csv]
      s: this:$(uniqid)_rule
      po:
        - [odrl:assigner, $(rule_assigner)~iri]
        - [odrl:assignee, $(rule_assignee)~iri]
        - [odrl:action, this:$(uniqid)_rule_action~iri]
        - [odrl:target, this:$(uniqid)_rule_target~iri]

    rule_action:
      sources:
        - [input~csv]
      s: this:$(uniqid)_rule_action
      po:
        - [rdf:value, $(rule_action)~iri]
        - [odrl:refinement, this:$(uniqid)_rule_action_refinement~iri]

    rule_action_refinement:
      sources:
        - [input~csv]
      s: this:$(uniqid)_rule_action_refinement
      po:
        - [odrl:leftOperand, $(rule_action_refinement_lo)~iri]
        - [odrl:operator, $(rule_action_refinement_o)~iri]
        - [odrl:rightOperand, $(rule_action_refinement_ro_value_iri)~iri]
        - [odrl:rightOperand, $(rule_action_refinement_ro_value_date), xsd:date]
        - [odrl:rightOperand, $(rule_action_refinement_ro_value_string), xsd:string]
        - [odrl:rightOperand, $(rule_action_refinement_ro_value_float), xsd:float]
        - [odrl:unit, $(rule_action_refinement_unit)~iri]

    rule_target:
      sources:
        - [input~csv]
      s: this:$(uniqid)_rule_target
      po:
        - [odrl:source, $(rule_target)~iri]
        - [odrl:refinement, this:$(uniqid)_rule_target_refinement~iri]

    rule_target_refinement:
      sources:
        - [input~csv]
      s: this:$(uniqid)_rule_target_refinement
      po:
        - [odrl:leftOperand, $(rule_target_refinement_lo)~iri]
        - [odrl:operator, $(rule_target_refinement_o)~iri]
        - [odrl:rightOperand, $(rule_target_refinement_ro_value_iri)~iri]
        - [odrl:rightOperand, $(rule_target_refinement_ro_value_date), xsd:date]
        - [odrl:rightOperand, $(rule_target_refinement_ro_value_string), xsd:string]
        - [odrl:rightOperand, $(rule_target_refinement_ro_value_float), xsd:float]
        - [odrl:unit, $(rule_target_refinement_unit)~iri]`;

    const inputFiles = {
      input: `type,uid,profile,rule_type,rule_action,rule_target,rule_assigner,rule_assignee,rule_action_refinement_lo,rule_action_refinement_o,rule_action_refinement_ro_value_iri,rule_action_refinement_ro_value_string,rule_action_refinement_ro_value_date,rule_action_refinement_ro_value_float,rule_action_refinement_unit,rule_assignee_refinement_lo,rule_assignee_refinement_o,rule_assignee_refinement_ro_value_iri,rule_assignee_refinement_ro_value_string,rule_assignee_refinement_ro_value_date,rule_assignee_refinement_ro_value_float,rule_assignee_refinement_unit,rule_target_refinement_lo,rule_target_refinement_o,rule_target_refinement_ro_value_iri,rule_target_refinement_ro_value_string,rule_target_refinement_ro_value_date,rule_target_refinement_ro_value_float,rule_target_refinement_unit,rule_constraint_lo,rule_constraint_o,rule_constraint_ro_value_iri,rule_constraint_ro_value_string,rule_constraint_ro_value_date,rule_constraint_ro_value_float,rule_constraint_unit,permission_duty_target,permission_duty_action,permission_duty_action_refinement_lo,permission_duty_action_refinement_o,permission_duty_action_refinement_ro_value_iri,permission_duty_action_refinement_ro_value_string,permission_duty_action_refinement_ro_value_date,permission_duty_action_refinement_ro_value_float,permission_duty_action_refinement_unit,permission_duty_constraint_lo,permission_duty_constraint_o,permission_duty_constraint_ro_value_iri,permission_duty_constraint_ro_value_string,permission_duty_constraint_ro_value_date,permission_duty_constraint_ro_value_float,permission_duty_constraint_unit,prohibition_remedy_action,prohibition_remedy_target,uniqid
      	http://www.w3.org/ns/odrl/2/Offer,https://example.com/policy_01,https://w3id.org/occe/,http://www.w3.org/ns/odrl/2/permission,https://w3id.org/occe/reIdentify,https://example.com/asset_1,https://example.com/Data_Center_1,https://example.com/John,https://w3id.org/occe/notMediatedBy,	http://www.w3.org/ns/odrl/2/eq,https://example.com/Data_Center_1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,32000090
      	http://www.w3.org/ns/odrl/2/Offer,https://example.com/policy_02,https://w3id.org/occe/,http://www.w3.org/ns/odrl/2/permission,https://w3id.org/occe/reIdentify,https://example.com/asset_2,https://example.com/Data_Center_2,https://example.com/Sarah,https://w3id.org/occe/notMediatedBy,	http://www.w3.org/ns/odrl/2/eq,https://example.com/Data_Center_2,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,60949991`,
    };

    const rml = await yarrrmlParse(yarrrml);
    const rdf = await rocketrml.parseFileLive(rml, inputFiles, {
      toRDF: true,
    });

    console.log(rdf);
  });
});
