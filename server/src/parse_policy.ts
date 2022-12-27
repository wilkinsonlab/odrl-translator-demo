import * as $rdf from "rdflib";

import { isValidUrl, getLabel } from "./utils.js";
import fetchUrl from "./fetch_url.js";
import parseXSDDuration from "./parse_xsd_duration.js";
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
  permissions?: Array<PermissionType>;
  prohibitions?: Array<ProhibitionType>;
};

const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
const XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
const ODRL = $rdf.Namespace("http://www.w3.org/ns/odrl/2/");
const OCCE = $rdf.Namespace("https://w3id.org/occe/");
const OAC = $rdf.Namespace("https://w3id.org/oac#");

const XSDNumericTypes = numericTypes.map((type) => XSD(type).value);
const XSDDateTypes = dateTypes.map((type) => XSD(type).value);

export default async function parsePolicy(input: string, language = "english") {
  return new Promise((resolve, reject) => {
    (async () => {
      if (input) {
        const object = JSON.parse(input);
        const baseURI = object["uid"];
        //const type = object["@type"];
        const { profile } = object;

        //const baseStore = $rdf.graph();
        const store = await getStore([
          "https://www.w3.org/ns/odrl/2/ODRL22.ttl",
          //profile,
        ]);

        //let base: string | null = "";
        let result = "";

        /*$rdf.parse(
          input,
          baseStore,
          "https://example.com/",
          "application/ld+json",
          async (error, _kb) => {
            if (error) {
              reject(error);
            } else {
              const lastTriple = _kb?.statementsMatching(
                undefined,
                undefined,
                undefined
              );

              if (lastTriple && lastTriple?.length > 0) {
                base = lastTriple.at(-1)!.subject.value;
              }*/

        const policyTranslation: PolicyType = {
          description: "",
        };

        if (baseURI) {
          $rdf.parse(
            input,
            store,
            baseURI,
            "application/ld+json",
            async (_error, kb) => {
              if (_error || !kb) {
                reject(_error);
              } else {
                const policy = new Policy(kb);
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
                  const actionsLabels = actions?.map((action) => action.label);

                  let permissionSentence = `The data controller, defined as ${assigner?.sources.map(
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

                  permissionSentence += `the ${parseTargets(targets!, kb)}`;

                  if (constraints.length > 0) {
                    finalPermissionObject.constraints = [];

                    for (const constraint of constraints) {
                      finalPermissionObject.constraints.push(
                        await parseConstraint(constraint, kb)
                      );
                    }
                  } else {
                    permissionSentence += " without any constraint.";
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

                    const targetType = kb.statementsMatching(
                      target?.object as any,
                      RDF("type"),
                      undefined
                    )[0];

                    sentence +=
                      targetType &&
                      targetType.object.value === ODRL("AssetCollection").value
                        ? "collection of assets"
                        : "asset";
                    sentence += ` located at ${target?.object.value}`;

                    targetsSentences.push(sentence);
                  }

                  const actionsLabels = actions?.map((action) => action.label);

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

                resolve(policyTranslation);
              }
            }
          );
        }
        /*}
          }
        );*/
      }
    })();
  });
}

/*
function getAllPermissions(
  permissionsTriples: Array<$rdf.Statement>,
  kb: $rdf.Formula
) {
  const permissions: Array<{
    targets: Array<$rdf.Statement>;
    actions: Array<$rdf.Statement> | undefined;
    assigner: $rdf.Statement | undefined;
    assignee: $rdf.Statement | undefined;
    duties: Array<$rdf.Statement> | undefined;
    constraints: $rdf.Statement | undefined;
  }> = [];

  permissionsTriples.forEach((permissionTriple) => {
    permissions.push({
      targets: kb.statementsMatching(
        permissionTriple.object as any,
        ODRL("target"),
        undefined
      ),
      actions: kb.statementsMatching(
        permissionTriple.object as any,
        ODRL("action"),
        undefined
      ),
      assigner: kb.statementsMatching(
        permissionTriple.object as any,
        ODRL("assigner"),
        undefined
      )[0],
      assignee: kb.statementsMatching(
        permissionTriple.object as any,
        ODRL("assignee"),
        undefined
      )[0],
      duties: kb.statementsMatching(
        permissionTriple.object as any,
        ODRL("duty"),
        undefined
      ),
      constraints: kb.statementsMatching(
        permissionTriple.object as any,
        ODRL("constraint"),
        undefined
      )[0],
    });
  });

  return permissions;
}

function getAllProhibitions(
  prohibitionsTriples: Array<$rdf.Statement>,
  kb: $rdf.Formula
) {
  const prohibitions: Array<{
    targets: Array<$rdf.Statement>;
    actions: Array<$rdf.Statement> | undefined;
    assigner: $rdf.Statement | undefined;
    assignee: $rdf.Statement | undefined;
    remedies: Array<$rdf.Statement> | undefined;
  }> = [];

  prohibitionsTriples.forEach((prohibitionTriple) => {
    prohibitions.push({
      targets: kb.statementsMatching(
        prohibitionTriple.object as any,
        ODRL("target"),
        undefined
      ),
      actions: kb.statementsMatching(
        prohibitionTriple.object as any,
        ODRL("action"),
        undefined
      ),
      assigner: kb.statementsMatching(
        prohibitionTriple.object as any,
        ODRL("assigner"),
        undefined
      )[0],
      assignee:
        kb.statementsMatching(
          prohibitionTriple.object as any,
          ODRL("assignee"),
          undefined
        )[0] ?? undefined,
      remedies: kb.statementsMatching(
        prohibitionTriple.object as any,
        ODRL("remedy"),
        undefined
      ),
    });
  });

  return prohibitions;
}*/

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
      const rightOperand = constraint.rightOperand;

      if (rightOperand) {
        const rightOperandDatatype = constraint.dataType;

        if (rightOperandDatatype) {
          if (XSDNumericTypes.includes(rightOperandDatatype.value)) {
            permissionSentence += constraint.leftOperandLabel;
          }

          const isDuration = [
            ODRL("timeInterval").value,
            ODRL("delayPeriod").value,
          ].includes(leftOperand.object.value);

          if (isDuration) {
            permissionSentence +=
              " " +
              getSentence(rightOperandDatatype.value)[leftOperand.object.value][
                operator.object.value
              ];
          } else {
            const leftOperandLabel = getSentenceOrLabel(
              leftOperand,
              kb
            ).toLocaleLowerCase();
            const rightOperandSentence = getSentence(
              rightOperandDatatype.value
            );
            const operatorSentence = getSentence(operator.object.value);

            permissionSentence += "";

            /**
             * If the right operand sentence is defined, we grab it.
             * Otherwise, fallback to the following sentence: "...with [leftOperand] [operator]..."
             */
            /*permissionSentence += rightOperandSentence
              ? rightOperandSentence[operator.object.value]
              : ` with ${leftOperandLabel} ${operatorSentence}`;*/

            permissionSentence += `${constraint.leftOperandLabel} ${operatorSentence}`;
          }

          permissionSentence += " ";

          const isRightOperandUrl = isValidUrl(rightOperand.object.value);

          if (isRightOperandUrl) {
            const labelTriple = (
              await fetchUrl(rightOperand.object.value)
            )?.statementsMatching(
              $rdf.Namespace(rightOperand.object.value)(""),
              RDFS("label"),
              undefined
            );

            if (labelTriple && labelTriple.length > 0) {
              permissionSentence += labelTriple[0].object.value;
            }
          } else {
            permissionSentence += isDuration
              ? parseXSDDuration(rightOperand.object.value)
              : rightOperand.object.value;
            permissionSentence +=
              leftOperand.object.value === ODRL("percentage").value ? "%" : "";
          }
        } else {
        }
      }
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
      "If this prohibition has been infringed by being exercised, the assignee must";
  } else {
    dutySentence +=
      "The assignee has a duty toward the data controller(s) and must";
  }

  dutySentence += " ";

  if (duty.actions && duty.actions.length > 0) {
    for (const action of duty.actions) {
      const toPreposition = [];

      if (action.uri !== ODRL("grantUse").value) {
        actionsLabels.push(action.label?.toLocaleLowerCase());
      } else {
        toPreposition.push(action.label?.toLocaleLowerCase());
      }

      dutySentence += listToString(actionsLabels);

      if (toPreposition.length > 0) {
        dutySentence += `${listToString(toPreposition)} to`;
      }

      dutySentence += " ";

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
          const oeprator = refinement.operator;
          const rightOperand = refinement.rightOperand;
          const unit = refinement.unit;

          if ([ODRL("compensate").value].includes(action.uri)) {
            if (dutyAssigners && dutyAssigners.length > 0) {
              dutySentence += `the data controller(s) defined as ${listToString(
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
                ?.sources.includes(rightOperand.object.value)
            ) {
              dutySentence += "him/them";
            } else {
              dutySentence += getSentence(leftOperand.object.value)[
                oeprator.object.value
              ];

              dutySentence += ` ${rightOperand.object.value}`;
            }
          } else {
            dutySentence += getSentence(leftOperand.object.value)[
              oeprator.object.value
            ];

            dutySentence += ` ${rightOperand.object.value}`;
          }

          if (unit) {
            const unitStore = await fetchUrl(unit.object.value);

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

      const rightOperand = constraint.rightOperand;

      let dutyConstraintSentence = "The ";
      dutyConstraintSentence += listToString(actionsLabels);
      dutyConstraintSentence += ` action${actionsLabels.length > 1 ? "s" : ""}`;
      dutyConstraintSentence += " ";

      const leftOperandTranslationObject = getSentence(
        leftOperand.object.value
      );

      dutyConstraintSentence += leftOperandTranslationObject
        ? leftOperandTranslationObject[operator.object.value]
        : getLabel(leftOperand, kb)?.toLocaleLowerCase();
      dutyConstraintSentence += " ";
      dutyConstraintSentence +=
        getSentenceOrLabel(rightOperand, kb) ?? rightOperand.object.value;

      if (leftOperand.object.value === ODRL("percentage").value) {
        dutyConstraintSentence += "%";
      }

      _duty.constraints.push(dutyConstraintSentence);
    }
  }

  return _duty;
}

function parseTargets(targets: Array<$rdf.Statement>, kb: $rdf.Formula) {
  const targetsSentences = [];

  for (const target of targets!) {
    let sentence = "the ";
    /**
     * Useful to know if it's a collection of assets or not.
     */
    const targetType = kb.statementsMatching(
      target?.object as any,
      RDF("type"),
      undefined
    )[0];

    sentence +=
      targetType && targetType.object.value === ODRL("AssetCollection").value
        ? "collection of assets"
        : "asset";
    sentence += ` located at ${target?.object.value}`;

    targetsSentences.push(sentence);
  }

  return listToString(targetsSentences);
}

function getSentenceOrLabel(triple: $rdf.Statement, kb: $rdf.Formula) {
  return getSentence(triple.object.value) ?? getLabel(triple, kb);
}

function listToString(list: Array<string>) {
  return list.join(", ").replace(/, ([^,]*)$/, " and $1");
}

function lastURISegment(uri: string) {
  return uri.split("/").at(-1);
}
