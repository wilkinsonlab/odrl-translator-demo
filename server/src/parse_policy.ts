import * as $rdf from "rdflib";

import { isValidUrl, listToString, getSentenceOrLabel } from "./utils.js";
import fetchIRI from "./fetch_iri.js";
import numericTypes from "./numeric_types.js";
import dateTypes from "./date_types.js";
import getSentence from "./sentences.js";
import languages from "./languages.js";
import translate from "./translate.js";

import Policy from "./policy.js";
import Permission from "./permission.js";
import Prohibition from "./prohibition.js";
import Duty from "./duty.js";
import Constraint from "./constraint.js";
import { interpolate } from "@poppinss/utils/build/helpers.js";
import Asset from "./asset.js";

type PermissionType = {
  sentence: string;
  constraints?: Array<string>;
  duties?: Array<DutyType>;
};

type ProhibitionType = {
  sentence: string;
  remedies?: Array<DutyType>;
};

type DutyType = {
  sentence: string;
  constraints?: Array<string>;
};

type PolicyType = {
  description: string;
  permissions: Array<PermissionType>;
  prohibitions: Array<ProhibitionType>;
};

const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
const XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
const ODRL = $rdf.Namespace("http://www.w3.org/ns/odrl/2/");
const OCCE = $rdf.Namespace("https://w3id.org/occe/");
const SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
const EX = $rdf.Namespace("https://example.com/");

const XSDNumericTypes = numericTypes.map((type) => XSD(type).value);
const XSDDateTypes = dateTypes.map((type) => XSD(type).value);

export default async function parsePolicy(
  input: string,
  language = "english"
): Promise<Array<PolicyType>> {
  return new Promise((resolve, reject) => {
    (async () => {
      if (input) {
        input = input.trim();

        let type;
        let graph;

        try {
          graph = JSON.parse(input);
          type = "application/ld+json";
        } catch {
          graph = input;
          type = "text/turtle";
        }

        const store = await getStore([
          "https://www.w3.org/ns/odrl/2/ODRL22.ttl",
        ]);

        const policies: Array<PolicyType> = [];

        $rdf.parse(
          input,
          store,
          type === "text/turtle" ? EX("").value : graph["uid"],
          type,
          async (_error, kb) => {
            if (_error || !kb) {
              reject(_error);
            } else {
              const policiesIRIs = new Set<string>();

              for (const policyType of [
                "Policy",
                "Set",
                "Offer",
                "Agreement",
                "Request",
              ]) {
                const policyTypeStatement = kb.statementsMatching(
                  undefined,
                  RDF("type"),
                  ODRL(policyType)
                );

                if (policyTypeStatement && policyTypeStatement.length > 0) {
                  policyTypeStatement.forEach((statement) => {
                    policiesIRIs.add(statement.subject.value);
                  });
                }
              }

              for (const policyIRI of policiesIRIs) {
                const policyTranslation: PolicyType = {
                  description: "",
                  permissions: [],
                  prohibitions: [],
                };

                const policy = new Policy(kb, policyIRI);
                const permissions = policy.permissions;
                const prohibitions = policy.prohibitions;
                const permissionsSentences = [];
                const prohibitionsSentences = [];

                for (const permission of permissions) {
                  const { targets, actions, functions, constraints, duties } =
                    permission;
                  const assigner = functions.get("assigner");
                  const assignee = functions.get("assignee");
                  const finalPermissionObject: PermissionType = {
                    sentence: "",
                  };
                  const actionsLabels = [];
                  const actionsRefinementsSetnences = [];

                  if (actions) {
                    for (const action of actions!) {
                      actionsLabels.push(
                        (await action.label()) + " " + (action.context ?? "")
                      );

                      if (action.refinements.length > 0) {
                        for (const refinement of action.refinements) {
                          actionsRefinementsSetnences.push(
                            await parseConstraint(refinement, kb)
                          );
                        }
                      }
                    }
                  }

                  let permissionSentence = `The policy issuer, defined as ${assigner?.sources.map(
                    (source) => lastURISegment(source)
                  )} gives the permission`;

                  if (assignee && assignee.sources.length > 0) {
                    permissionSentence += assignee
                      ? ` to ${listToString(
                          assignee.sources.map(
                            (source) => lastURISegment(source)!
                          )
                        )}`
                      : "";
                  }

                  if (actionsLabels && actionsLabels.length > 0) {
                    permissionSentence += ` to ${listToString(actionsLabels)} `;
                  }

                  permissionSentence += parseTargets(targets!, kb);

                  if (
                    constraints.length > 0 ||
                    actionsRefinementsSetnences.length > 0
                  ) {
                    finalPermissionObject.constraints = [];

                    for (const constraint of constraints) {
                      const constraintSentence = await parseConstraint(
                        constraint,
                        kb
                      );
                      finalPermissionObject.constraints.push(
                        language !== "english"
                          ? await translate(
                              constraintSentence,
                              "english",
                              language
                            )
                          : constraintSentence
                      );
                    }

                    finalPermissionObject.constraints.push(
                      ...actionsRefinementsSetnences
                    );
                  } else {
                    //permissionSentence += " without any constraint.";
                  }

                  if (language !== "english") {
                    permissionSentence = await translate(
                      permissionSentence,
                      "english",
                      language
                    );
                  }

                  finalPermissionObject.sentence = permissionSentence;

                  if (duties && duties.length > 0) {
                    finalPermissionObject.duties = [];

                    for (const duty of duties) {
                      let _duty = await parseDuty(duty, kb, permission);

                      if (language !== "english") {
                        _duty.sentence = await translate(
                          _duty.sentence,
                          "english",
                          language
                        );

                        if (_duty.constraints) {
                          _duty.constraints = await Promise.all(
                            _duty.constraints.map(async (constraint) => {
                              return await translate(
                                constraint,
                                "english",
                                language
                              );
                            })
                          );
                        }
                      }

                      finalPermissionObject.duties.push(_duty);
                    }
                  }

                  permissionsSentences.push(finalPermissionObject);
                }

                for (const prohibition of prohibitions) {
                  const { targets, actions, functions, remedies } = prohibition;
                  const assigners = functions.get("assigner");
                  const assignees = functions.get("assignee");
                  const finalProhibitionSentence: ProhibitionType = {
                    sentence: "",
                  };

                  const targetsSentences = [];

                  for (const target of targets!) {
                    let sentence = "the ";

                    const targetType = target.type;

                    sentence +=
                      targetType && targetType === ODRL("AssetCollection").value
                        ? "collection of assets"
                        : "asset";
                    sentence += ` located at ${target.url}`;

                    targetsSentences.push(sentence);
                  }

                  const actionsLabels = [];

                  if (actions) {
                    for (const action of actions) {
                      actionsLabels.push(await action.label());
                    }
                  }

                  let prohibitionSentence = "";

                  if (assigners) {
                    prohibitionSentence += `The data controllers(s), defined as ${listToString(
                      assigners?.sources.map(
                        (assigner) => lastURISegment(assigner)!
                      )
                    )} prohibits `;
                  }

                  prohibitionSentence += assignees
                    ? ` to ${listToString(
                        assignees?.sources.map(
                          (assignee) => lastURISegment(assignee)!
                        )
                      )}`
                    : "";

                  if (actionsLabels && actionsLabels?.length > 0) {
                    prohibitionSentence += ` to ${listToString(
                      actionsLabels
                    )} `;
                  }

                  prohibitionSentence += listToString(targetsSentences);

                  if (language !== "english") {
                    prohibitionSentence = await translate(
                      prohibitionSentence,
                      "english",
                      language
                    );
                  }

                  finalProhibitionSentence.sentence = prohibitionSentence;

                  if (remedies && remedies.length > 0) {
                    finalProhibitionSentence.remedies = [];

                    for (const remedy of remedies) {
                      let remedyObject = {
                        sentence: "",
                      };

                      let remedySentence = (
                        await parseDuty(remedy, kb, prohibition, true)
                      ).sentence;

                      if (language !== "english") {
                        remedySentence = await translate(
                          remedySentence,
                          "english",
                          language
                        );
                      }

                      remedyObject.sentence = remedySentence;

                      finalProhibitionSentence.remedies.push(remedyObject);
                    }
                  }

                  prohibitionsSentences.push(finalProhibitionSentence);
                }

                const type = policy.type?.object.value!;

                let policyDescription = getSentence(
                  isValidUrl(type) ? type : ODRL(type).value
                );

                if (language !== "english") {
                  policyDescription = await translate(
                    policyDescription,
                    "english",
                    language
                  );
                }

                policyTranslation.description = policyDescription;
                policyTranslation.permissions = permissionsSentences;
                policyTranslation.prohibitions = prohibitionsSentences;

                policies.push(policyTranslation);
              }

              resolve(policies);
            }
          }
        );
      }
    })();
  });
}

async function getStore(urls: Array<string>) {
  const store = $rdf.graph();
  const storeFetcher = new $rdf.Fetcher(store);

  await storeFetcher.load(urls, {
    timeout: 5000,
    credentials: "omit",
    noMeta: true,
  });

  return store;
}

async function parseConstraint(constraint: Constraint, kb: $rdf.Formula) {
  const leftOperand = constraint.leftOperand;

  let permissionSentence = "";

  if (leftOperand) {
    const operator = constraint.operator;

    if (operator) {
      const rightOperands = constraint.rightOperands;

      if (rightOperands.length > 0) {
        const operatorSentence = getSentence(operator.object.value);

        let leftOperandLabel = await constraint.leftOperandLabel();

        const isDuration = [
          ODRL("timeInterval").value,
          ODRL("delayPeriod").value,
          ODRL("elapsedTime").value,
          ODRL("meteredTime").value,
        ].includes(leftOperand.object.value);

        if (isDuration) {
          leftOperandLabel = interpolate(leftOperandLabel, {
            rule: constraint.rule.type,
            action: listToString(await constraint.rule.getActionLabels()),
          });

          permissionSentence += leftOperandLabel;
        } else {
          permissionSentence += `${leftOperandLabel} ${operatorSentence}`;
        }
      }

      permissionSentence += " ";
      permissionSentence += await constraint.rightOperandLabels();
    }
  }

  return permissionSentence;
}

async function parseDuty(
  duty: Duty,
  kb: $rdf.Formula,
  parent: Permission | Prohibition,
  remedy = false
) {
  const _duty = {
    sentence: "",
    constraints: [] as Array<string>,
  };
  const dutyTargets = duty.targets;
  const dutyAssigners = duty.functions.get("assigner")?.sources;
  const dutyConstraints = duty.constraints;
  const actionsLabels = [];

  let dutySentence = "";

  if (remedy) {
    dutySentence +=
      "If this prohibition has been infringed by being exercised, the following consequences apply: ";
  } else {
    dutySentence += `A duty must be fulfilled to execute the action(s) of the ${parent.type}: `;
  }

  dutySentence += " ";

  if (duty.actions && duty.actions.length > 0) {
    for (const action of duty.actions) {
      const actionLabel = await action.label();
      const toPreposition = [];

      if (action.iri !== ODRL("grantUse").value) {
        actionsLabels.push(actionLabel);
      } else {
        toPreposition.push(actionLabel);
      }

      dutySentence += listToString(actionsLabels);

      if (toPreposition.length > 0) {
        dutySentence += `${listToString(toPreposition)} to`;
      }

      dutySentence += " ";
      dutySentence += `${action.context} ` ?? "";

      if (dutyTargets && dutyTargets.length > 0) {
        dutySentence += `${parseTargets(dutyTargets, kb)}`;
      } else {
        const dutyAssigner = duty.functions.get("assigner");

        /*if (dutyAssigner) {
          dutySentence += `the party defined as ${listToString(
            dutyAssigner.sources
          )}`;
        } else {
          dutySentence += "him";
        }

        dutySentence += " ";*/
      }

      const actionRefinements = action.refinements;

      if (actionRefinements && actionRefinements.length > 0) {
        for (const refinement of actionRefinements) {
          const leftOperand = refinement.leftOperand;
          const operator = refinement.operator;
          const rightOperands = refinement.rightOperands;
          const unit = refinement.unit;

          if ([ODRL("compensate").value].includes(action.iri)) {
            if (dutyAssigners && dutyAssigners.length > 0) {
              dutySentence += `the policy issuer(s) defined as ${listToString(
                dutyAssigners.map((assigner) => lastURISegment(assigner)!)
              )}`;
            } else {
              dutySentence += "him/them";
            }

            dutySentence += " by ";
          }

          if (ODRL("recipient").value === leftOperand.object.value) {
            if (
              parent.functions
                .get("assigner")
                ?.sources.filter((assigner) =>
                  rightOperands.map((ro) => ro.value).includes(assigner)
                ).length! > 0
            ) {
              dutySentence += "him/them";
            }
          }

          dutySentence += getSentence(leftOperand.object.value)
            ? getSentence(leftOperand.object.value)[operator.object.value]
            : getSentence(operator.object.value);

          dutySentence += ` ${await refinement.rightOperandLabels()}`;

          if (unit) {
            const unitStore = await fetchIRI(unit.object.value);

            const labels = unitStore?.statementsMatching(
              new $rdf.NamedNode(unit.object.value),
              RDFS("label"),
              undefined
            );

            if (labels && labels?.length > 0) {
              const label = labels.filter((_label) => {
                if (_label.object.termType === "Literal") {
                  return _label.object.language === "en";
                }
              })[0];

              dutySentence += ` ${label.object.value}`;
            }
          }
        }
      }
    }
  }

  _duty.sentence += dutySentence;

  if (dutyConstraints?.length > 0) {
    _duty.constraints = [];

    for (const constraint of dutyConstraints) {
      const leftOperand = constraint.leftOperand;

      const operator = constraint.operator;

      const rightOperands = constraint.rightOperands;

      let dutyConstraintSentence = "The ";
      dutyConstraintSentence += listToString(actionsLabels);
      dutyConstraintSentence += ` action${actionsLabels.length > 1 ? "s" : ""}`;
      dutyConstraintSentence += " ";

      const leftOperandTranslationObject = getSentence(
        leftOperand.object.value
      );

      dutyConstraintSentence += leftOperandTranslationObject
        ? leftOperandTranslationObject[operator.object.value]
        : await getSentenceOrLabel(leftOperand, kb);
      dutyConstraintSentence += " ";
      dutyConstraintSentence += await constraint.rightOperandLabels();

      if (leftOperand.object.value === ODRL("percentage").value) {
        dutyConstraintSentence += "%";
      }

      _duty.constraints.push(dutyConstraintSentence);
    }
  }

  return _duty;
}

function parseTargets(targets: Array<Asset>, kb: $rdf.Formula) {
  const targetsSentences = [];

  for (const target of targets!) {
    let sentence = "the ";
    /**
     * Useful to know if it's a collection of assets or not.
     */
    const targetType = target.type;

    sentence +=
      targetType && targetType === ODRL("AssetCollection").value
        ? "collection of assets"
        : "asset";
    sentence += ` located at ${target.url}`;

    targetsSentences.push(sentence);
  }

  return listToString(targetsSentences);
}

function lastURISegment(uri: string) {
  return uri.split("/").at(-1);
}
