import type { Obligation, Permission, Policy, Prohibition } from "../types";

import { ref, reactive, computed } from "vue";
import useGetRandomID from "./useGetRandomID";
import { ODRL } from "../../../server/src/namespaces";

const policies = reactive({
  policies: [] as any
});

const policy = reactive({
  id: useGetRandomID(),
  type: ODRL("Set").value,
  creator: null,
  description: null,
  issued: new Date().toISOString().slice(0, 10),
  rules: {
    permissions: [] as Array<Permission>,
    prohibitions: [] as Array<Prohibition>,
    obligations: [] as Array<Obligation>
  },
  references: [] as Array<any>
});

/*const policy = reactive({
  id: 3135535980,
  type: "http://www.w3.org/ns/odrl/2/Offer",
  creator: null,
  description: null,
  issued: "2023-05-28",
  rules: {
    permissions: [
      {
        id: 2904600500,
        type: "http://www.w3.org/ns/odrl/2/permission",
        policy_id: 3135535980,
        cce: "reidentification_of_individuals_with_irp",
        targets: [
          {
            id: 4038216710,
            policy_id: 3135535980,
            rule_id: 2904600500,
            type: "http://www.w3.org/ns/odrl/2/AssetCollection",
            uri: "https://example.com/assets_01",
            uid: null,
            source: "https://example.com/assets_01",
            refinements: [],
            operand: null,
            first: null,
            logical_constraints: {
              and: [],
              or: [],
              andSequence: [],
              xone: []
            }
          }
        ],
        actions: [
          {
            id: 2125455817,
            policy_id: 3135535980,
            rule_id: 2904600500,
            value: "http://www.w3.org/ns/odrl/2/modify",
            refinements: [],
            operand: null,
            first: null,
            logical_constraints: {
              and: [],
              or: [],
              andSequence: [],
              xone: []
            }
          }
        ],
        assigner: "https://example.com/Data_Center_01",
        assignees: [
          {
            id: 3309985409,
            policy_id: 3135535980,
            rule_id: 2904600500,
            uri: "https://example.com/assignee_01",
            type: "http://www.w3.org/ns/odrl/2/Party",
            uid: "https://example.com/assignee_01",
            source: null,
            refinements: [],
            operand: null,
            first: null,
            logical_constraints: {
              and: [],
              or: [],
              andSequence: [],
              xone: []
            }
          }
        ],
        constraints: [],
        duties: [
          {
            operand: null,
            id: 3489799962,
            policy_id: 3135535980,
            targets: [
              {
                id: 1708367817,
                policy_id: 3135535980,
                type: "http://www.w3.org/ns/odrl/2/Asset",
                uid: null,
                source: null,
                refinements: [],
                duty_id: 3489799962,
                uri: null
              }
            ],
            actions: [
              {
                id: 1049014309,
                policy_id: 3135535980,
                rule_id: 2904600500,
                value: "http://www.w3.org/ns/odrl/2/share",
                refinements: [
                  {
                    id: 1548986050,
                    policy_id: 3135535980,
                    rule_id: 2904600500,
                    action_id: 1049014309,
                    duty_id: 3489799962,
                    left_operand: "http://www.w3.org/ns/odrl/2/purpose",
                    operator: "http://www.w3.org/ns/odrl/2/eq",
                    valueType: "iri",
                    right_operand_value_duration: null,
                    right_operand_value_date: null,
                    right_operand_value_dateTime: null,
                    right_operand_value_float: null,
                    unit: null,
                    right_operand_value_iri:
                      "http://purl.obolibrary.org/obo/NCIT_C77140",
                    next: 2899940933,
                    right_operand_value_string: null
                  },
                  {
                    id: 2899940933,
                    policy_id: 3135535980,
                    left_operand: "http://www.w3.org/ns/odrl/2/recipient",
                    operator: "http://www.w3.org/ns/odrl/2/eq",
                    valueType: "iri",
                    right_operand_value_duration: null,
                    right_operand_value_date: null,
                    right_operand_value_dateTime: null,
                    right_operand_value_float: null,
                    rule_id: 2904600500,
                    action_id: 1049014309,
                    duty_id: 3489799962,
                    right_operand_value_iri:
                      "http://purl.obolibrary.org/obo/NCIT_C29867",
                    next: "null",
                    right_operand_value_string: null
                  }
                ],
                operand: "andSequence",
                first: 1548986050,
                logical_constraints: {
                  and: [],
                  or: [],
                  andSequence: [
                    {
                      id: 1548986050,
                      policy_id: 3135535980,
                      rule_id: 2904600500,
                      action_id: 1049014309,
                      duty_id: 3489799962,
                      left_operand: "http://www.w3.org/ns/odrl/2/purpose",
                      operator: "http://www.w3.org/ns/odrl/2/eq",
                      valueType: "iri",
                      right_operand_value_duration: null,
                      right_operand_value_date: null,
                      right_operand_value_dateTime: null,
                      right_operand_value_float: null,
                      unit: null,
                      right_operand_value_iri:
                        "http://purl.obolibrary.org/obo/NCIT_C77140",
                      next: 2899940933,
                      right_operand_value_string: null
                    },
                    {
                      id: 2899940933,
                      policy_id: 3135535980,
                      left_operand: "http://www.w3.org/ns/odrl/2/recipient",
                      operator: "http://www.w3.org/ns/odrl/2/eq",
                      valueType: "iri",
                      right_operand_value_duration: null,
                      right_operand_value_date: null,
                      right_operand_value_dateTime: null,
                      right_operand_value_float: null,
                      rule_id: 2904600500,
                      action_id: 1049014309,
                      duty_id: 3489799962,
                      right_operand_value_iri:
                        "http://purl.obolibrary.org/obo/NCIT_C29867",
                      next: "null",
                      right_operand_value_string: null
                    }
                  ],
                  xone: []
                },
                duty_id: 3489799962
              }
            ],
            assigner: null,
            assignees: [],
            constraints: [],
            first: null,
            logical_constraints: {
              xone: [],
              and: [],
              andSequence: [],
              or: []
            },
            rule_id: 2904600500,
            consequences: []
          }
        ]
      },
      {
        id: 869327217,
        type: "http://www.w3.org/ns/odrl/2/permission",
        policy_id: 3135535980,
        cce: "clinical_care",
        targets: [
          {
            id: 4183208055,
            policy_id: 3135535980,
            rule_id: 869327217,
            type: "http://www.w3.org/ns/odrl/2/AssetCollection",
            uid: null,
            source: "https://example.com/assets_01",
            refinements: [],
            uri: "https://example.com/assets_01",
            operand: null,
            first: null,
            logical_constraints: {
              and: [],
              or: [],
              andSequence: [],
              xone: []
            }
          }
        ],
        actions: [
          {
            id: 1782906490,
            policy_id: 3135535980,
            rule_id: 869327217,
            value: "http://www.w3.org/ns/odrl/2/use",
            refinements: [
              {
                id: 2633318211,
                policy_id: 3135535980,
                rule_id: 869327217,
                action_id: 1782906490,
                left_operand: "http://www.w3.org/ns/odrl/2/purpose",
                operator: "http://www.w3.org/ns/odrl/2/isA",
                right_operand_value_iri:
                  "http://purl.obolibrary.org/obo/DUO_0000043",
                right_operand_value_string: null,
                right_operand_value_duration: null,
                right_operand_value_date: null,
                right_operand_value_dateTime: null,
                right_operand_value_float: null,
                unit: null,
                valueType: "iri",
                next: "null"
              }
            ],
            operand: null,
            first: null,
            logical_constraints: {
              and: [],
              or: [],
              andSequence: [],
              xone: []
            }
          }
        ],
        assigner: "https://example.com/Data_Center_01",
        assignees: [],
        constraints: [],
        duties: []
      }
    ],
    prohibitions: [
      {
        id: 3462910446,
        type: "http://www.w3.org/ns/odrl/2/prohibition",
        policy_id: 3135535980,
        cce: "reidentification_of_individuals_without_irp",
        targets: [
          {
            id: 2586567097,
            policy_id: 3135535980,
            rule_id: 3462910446,
            type: "http://www.w3.org/ns/odrl/2/AssetCollection",
            uid: null,
            source: "https://example.com/assets_01",
            refinements: [],
            uri: "https://example.com/assets_01",
            operand: null,
            first: null,
            logical_constraints: {
              and: [],
              or: [],
              andSequence: [],
              xone: []
            }
          }
        ],
        actions: [
          {
            id: 2533335809,
            policy_id: 3135535980,
            rule_id: 3462910446,
            value: "http://www.w3.org/ns/odrl/2/modify",
            refinements: [],
            operand: null,
            first: null,
            logical_constraints: {
              and: [],
              or: [],
              andSequence: [],
              xone: []
            }
          }
        ],
        assigner: "https://example.com/Data_Center_01",
        assignees: [],
        constraints: [],
        remedies: []
      }
    ],
    obligations: []
  },
  references: []
});*/

policies.policies.push(policy);

const done = ref(false);

function onDone() {
  done.value = true;
}

export default (function () {
  return () => {
    return {
      policy,
      onDone,
      done,
      policies
    };
  };
})();
