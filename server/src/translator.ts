import { interpolate } from "@poppinss/utils/build/helpers.js";

import Policy from "./policy.js";
import { CC, DPV, OBO, ODRL, OCCE, XSD } from "./namespaces.js";
import getSentence from "./sentences.js";
import {
  getLabels,
  getLabelsFromIRI,
  isValidUrl,
  listToString,
} from "./utils.js";
import cces from "./cces.js";
import Permission from "./permission.js";
import Action from "./action.js";
import Rule from "./rule.js";
import Constraint from "./constraint.js";
import Duty from "./duty.js";
import Prohibition from "./prohibition.js";
import parseXSDDuration from "./parse_xsd_duration.js";

export interface BaseRule {
  actions: Array<TranslatedAction>;
  constraints: Array<string>;
  cce: string;
}

export interface TranslatedAction {
  sentence: string;
  refinements: Array<string>;
}

export interface TranslatedObligation extends BaseRule {
  consequences: Record<string, Omit<TranslatedObligation, "cce">>;
}

export interface TranslatedPermission extends BaseRule {
  duties: Record<string, Omit<TranslatedObligation, "cce">>;
}

export interface TranslatedProhibition extends BaseRule {
  remedies: Record<string, Omit<TranslatedObligation, "consequences" | "cce">>;
}

export interface Translation {
  description: string;
  permissions: Record<string, TranslatedPermission>;
  prohibitions: Record<string, TranslatedProhibition>;
  obligations: Record<string, TranslatedObligation>;
}

export default class PolicyTranslator {
  #translations = {
    description: "",
    permissions: {},
    prohibitions: {},
    obligations: {},
  } as Translation;

  constructor(private policy: ReturnType<Policy["toJSON"]>) {}

  public get translations() {
    return this.#translations;
  }

  async translate() {
    const {
      type,
      issuedDate,
      creator,
      permissions,
      prohibitions,
      obligations,
    } = this.policy;
    this.#translations.description = interpolate(getSentence(type)!, {
      creator: `created by ${creator}`,
      issued: `issued on ${issuedDate}`,
    });

    for (const permission of permissions) {
      if (!(permission.id in this.#translations.permissions)) {
        this.#translations.permissions[permission.id] = {
          cce: cces[permission.cce],
          actions: [],
          duties: {},
          constraints: [],
        };

        if (permission.targets.length > 0) {
          for (const target of permission.targets) {
            if (target.refinements.length > 0) {
              for (const refinement of target.refinements) {
                this.#translations.permissions[permission.id].constraints.push(
                  await this.#translateConstraint(refinement)
                );
              }
            }
          }
        }
      }

      await this.#translatePermission(permission);
    }

    for (const prohibition of prohibitions) {
      if (!(prohibition.id in this.#translations.prohibitions)) {
        this.#translations.prohibitions[prohibition.id] = {
          cce: cces[prohibition.cce],
          actions: [],
          remedies: {},
          constraints: [],
        };
      }

      await this.#translateProhibition(prohibition);
    }

    for (const obligation of obligations) {
      if (!(obligation.id in this.#translations.obligations)) {
        this.#translations.obligations[obligation.id] = {
          cce: cces[obligation.cce],
          actions: [],
          consequences: {},
          constraints: [],
        };
      }

      if (obligation.targets.length > 0) {
        for (const target of obligation.targets) {
          if (target.refinements.length > 0) {
            for (const refinement of target.refinements) {
              this.#translations.obligations[obligation.id].constraints.push(
                await this.#translateConstraint(refinement)
              );
            }
          }
        }
      }

      await this.#translateObligation(obligation);
    }
  }

  async #translatePermission(permission: ReturnType<Permission["toJSON"]>) {
    const {
      targets,
      outputs,
      coverage,
      actions,
      functions,
      duties,
      constraints,
    } = permission;

    for (const action of actions) {
      const actionRefinements = [];

      let sentence = "";

      if (functions.assigner.length > 0) {
        const assigners = [];

        sentence += "The assigner(s) ";

        for (const assigner of functions.assigner) {
          if (assigner.name) {
            assigners.push(
              `${assigner.name} (${listToString(assigner.values)})`
            );
          } else {
            assigners.push(listToString(assigner.values));
          }
        }

        sentence += `${listToString(assigners)} give the permission to`;
      } else {
        sentence += "Permission to";
      }

      sentence += " ";

      sentence += await this.#translateAction(action, permission);

      for (const refinement of action.refinements) {
        actionRefinements.push(await this.#translateConstraint(refinement));
      }

      this.#translations.permissions[permission.id].actions.push({
        sentence: sentence,
        refinements: actionRefinements,
      });
    }

    for (const duty of duties) {
      if (!(duty.id in this.#translations.permissions[permission.id].duties)) {
        this.#translations.permissions[permission.id].duties[duty.id] = {
          actions: [],
          consequences: {},
          constraints: [],
        };
      }

      this.#translateDuty(duty, permission.id);
    }

    for (const constraint of constraints) {
      this.#translations.permissions[permission.id].constraints.push(
        await this.#translateConstraint(constraint)
      );
    }

    if (coverage) {
      this.#translations.permissions[permission.id].constraints.push(
        `Must operate under the ${listToString(
          await getLabelsFromIRI(coverage)
        )} jurisdiction`
      );
    }
  }

  async #translateProhibition(prohibition: ReturnType<Prohibition["toJSON"]>) {
    const {
      targets,
      outputs,
      coverage,
      actions,
      functions,
      remedies,
      constraints,
    } = prohibition;

    for (const action of actions) {
      const actionRefinements = [];

      let sentence = "";

      if (functions.assigner.length > 0) {
        const assigners = [];

        sentence += "The assigner(s) ";

        for (const assigner of functions.assigner) {
          if (assigner.name) {
            assigners.push(
              `${assigner.name} (${listToString(assigner.values)})`
            );
          } else {
            assigners.push(listToString(assigner.values));
          }
        }

        sentence += `${listToString(assigners)} prohibit to`;
      } else {
        sentence += "Prohibition to";
      }

      sentence += " ";

      sentence += await this.#translateAction(action, prohibition);

      for (const refinement of action.refinements) {
        actionRefinements.push(await this.#translateConstraint(refinement));
      }

      this.#translations.prohibitions[prohibition.id].actions.push({
        sentence: sentence,
        refinements: actionRefinements,
      });
    }

    for (const remedy of remedies) {
      if (
        !(remedy.id in this.#translations.prohibitions[prohibition.id].remedies)
      ) {
        this.#translations.prohibitions[prohibition.id].remedies[remedy.id] = {
          actions: [],
          constraints: [],
        };
      }

      this.#translateDuty(remedy, prohibition.id);
    }

    for (const constraint of constraints) {
      this.#translations.prohibitions[prohibition.id].constraints.push(
        await this.#translateConstraint(constraint)
      );
    }

    for (const constraint of constraints) {
      this.#translations.prohibitions[prohibition.id].constraints.push(
        await this.#translateConstraint(constraint)
      );
    }

    if (coverage) {
      this.#translations.permissions[prohibition.id].constraints.push(
        `Prohibition to operate under the ${listToString(
          await getLabelsFromIRI(coverage)
        )} jurisdiction`
      );
    }
  }

  async #translateObligation(obligation: ReturnType<Duty["toJSON"]>) {
    const {
      targets,
      outputs,
      coverage,
      actions,
      functions,
      consequences,
      constraints,
    } = obligation;

    for (const action of actions) {
      const actionRefinements = [];

      let sentence = "";

      if (functions.assigner.length > 0) {
        const assigners = [];

        sentence += "The assigner(s) ";

        for (const assigner of functions.assigner) {
          if (assigner.name) {
            assigners.push(
              `${assigner.name} (${listToString(assigner.values)})`
            );
          } else {
            assigners.push(listToString(assigner.values));
          }
        }

        sentence += `${listToString(assigners)} oblige to`;
      } else {
        sentence += "Obligation to";
      }

      sentence += " ";

      sentence += await this.#translateAction(action, obligation);

      for (const refinement of action.refinements) {
        actionRefinements.push(await this.#translateConstraint(refinement));
      }

      this.#translations.obligations[obligation.id].actions.push({
        sentence: sentence,
        refinements: actionRefinements,
      });
    }

    for (const consequence of consequences) {
      if (
        !(
          consequence.id in
          this.#translations.obligations[obligation.id].consequences
        )
      ) {
        this.#translations.obligations[obligation.id].consequences[
          consequence.id
        ] = {
          actions: [],
          consequences: {},
          constraints: [],
        };
      }

      this.#translateDuty(consequence, obligation.id);
    }

    for (const constraint of constraints) {
      this.#translations.obligations[obligation.id].constraints.push(
        await this.#translateConstraint(constraint)
      );
    }

    if (coverage) {
      this.#translations.obligations[obligation.id].constraints.push(
        `Obligation to operate under the ${listToString(
          await getLabelsFromIRI(coverage)
        )} jurisdiction`
      );
    }
  }

  async #translateAction(
    action: ReturnType<Action["toJSON"]>,
    rule: ReturnType<Rule["toJSON"]>
  ) {
    const { functions, targets } = rule;
    const { iri, refinements } = action;
    const _functions = {
      assignee: [] as Array<string>,
      assigner: [] as Array<string>,
      attributedParty: [] as Array<string>,
      attributingParty: [] as Array<string>,
      compensatedParty: [] as Array<string>,
      compensatingParty: [] as Array<string>,
      consentedParty: [] as Array<string>,
      consentingParty: [] as Array<string>,
      contractedParty: [] as Array<string>,
      contractingParty: [] as Array<string>,
      informedParty: [] as Array<string>,
      informingParty: [] as Array<string>,
      trackedParty: [] as Array<string>,
      trackingParty: [] as Array<string>,
      sharingParty: [] as Array<string>,
      sharedParty: [] as Array<string>,
      acknowledgingParty: [] as Array<string>,
      acknowledgedParty: [] as Array<string>,
      collaboratingParty: [] as Array<string>,
      collaboratedParty: [] as Array<string>,
      negotiatingParty: [] as Array<string>,
      negotiatedParty: [] as Array<string>,
    };
    let sentence = "";

    for (const [key, party] of Object.entries(functions)) {
      if (party.length > 0) {
        party.forEach((_party) => {
          let partySentence = "";

          if (_party.name) {
            partySentence += `${_party.name} `;

            if (_party.values.length > 0) {
              sentence += "located at ";
            }
          }

          if (_party.values.length > 0) {
            partySentence += listToString(_party.values);
          }

          _functions[key as keyof typeof _functions].push(partySentence);
        });
      }
    }

    // If action is "share"
    if (iri === ODRL("share").value) {
      // Fill sharedParties with IRIs of right operand from refinements if "recipient" left operand is used
      if (refinements.length > 0) {
        refinements.forEach((refinement) => {
          if (refinement.leftOperand === ODRL("recipient").value) {
            _functions.sharedParty.push(...refinement.rightOperand.map(String));
          }
        });
      }
    }

    // Try to get action label from the dictionary or from the IRI
    const actionLabel =
      (getSentence(iri) as string) ?? (await getLabelsFromIRI(iri));
    sentence +=
      typeof actionLabel === "string"
        ? actionLabel.toLowerCase()
        : listToString(actionLabel);
    sentence += " ";

    if (iri === ODRL("inform").value && _functions.informedParty.length > 0) {
      sentence += `${listToString(_functions.informedParty)} about `;
    }

    let hasContext = false;

    if (refinements.length > 0) {
      for (const refinement of refinements) {
        if (refinement.leftOperand === DPV("Context").value) {
          hasContext = true;

          const labels = await Promise.all(
            refinement.rightOperand.map(async ({ value }) =>
              typeof value === "string" && isValidUrl(value)
                ? listToString(await getLabelsFromIRI(value))
                : value
            )
          );

          const conjunction =
            refinement.operator === ODRL("isAnyOf").value ? "or" : "and";

          sentence += listToString(labels, conjunction);
        }
      }
    }

    if (targets.length > 0) {
      let targetsSentences = [] as Array<string>;

      targets.forEach((target) => {
        let targetSentence = "";

        // If a context is defined on the refinement of the action, don't add the targets to the sentence.
        if (
          !hasContext &&
          ![
            //ODRL("inform").value,
            CC("Attribution").value,
            OBO("NCIT_C73529").value,
            OBO("NCIT_C19026").value,
            OCCE("negotiate").value,
          ].includes(iri)
        ) {
          if (target.types.includes("http://www.w3.org/ns/odrl/2/Asset")) {
            targetSentence += " the asset";
          } else {
            targetSentence += " the collection of assets";
          }

          if (target.title) {
            targetSentence += ` (${target.title})`;

            if (target.urls.length > 0) {
              targetSentence += " located at ";
            }
          }

          if (target.urls.length > 0) {
            targetSentence += listToString(target.urls);
          }
        }

        targetsSentences.push(targetSentence);
      });

      sentence += listToString(targetsSentences, "and/or");
    }

    if (
      (_functions.sharedParty.length > 0 ||
        _functions.collaboratingParty.length > 0 ||
        _functions.negotiatedParty.length > 0) &&
      [
        ODRL("share").value,
        OBO("NCIT_C73529").value,
        OCCE("negotiate").value,
      ].includes(iri)
    ) {
      sentence += " with ";

      if (iri === ODRL("share").value) {
        sentence += listToString(_functions.sharedParty);
      } else if (iri === OBO("NCIT_C73529").value) {
        sentence += listToString(_functions.collaboratingParty);
      } else if (iri === OCCE("negotiate").value) {
        sentence += listToString(_functions.negotiatedParty);
      }
    }

    if (_functions.consentingParty.length > 0) {
      sentence += " from ";

      if (
        _functions.consentingParty.filter((party) =>
          functions.consentingParty
            .flatMap((consentingParty) => consentingParty.values)
            .includes(party)
        ).length > 0 ||
        (_functions.consentingParty.length === 0 &&
          functions.consentingParty.length === 0)
      ) {
        sentence += "the assigner located at ";
      }

      sentence += listToString(_functions.consentingParty);
    }
    if (
      iri === CC("Attribution").value &&
      _functions.acknowledgedParty.length > 0
    ) {
      sentence += listToString(_functions.acknowledgedParty);
    }

    if (iri === ODRL("compensate").value) {
      if (_functions.compensatedParty.length > 0) {
        sentence += ` ${listToString(_functions.compensatedParty)}`;
      } else {
        sentence += " the assigner";
      }
    }

    return sentence.replace(/\s+/g, " ").trim();
  }

  async #translateConstraint(
    constraint: ReturnType<Constraint["toJSON"]>,
    action?: ReturnType<Action["toJSON"]>
  ): Promise<string> {
    const { leftOperand, operator, rightOperand } = constraint;

    // Context serves as a context for the action, so we don't need to translate this constraint.
    if (leftOperand === DPV("Context").value) {
      return;
    }

    let sentence = getSentence(`${leftOperand}.${operator}`);

    if (sentence) {
      const rightOperands = await this.#translateRightOperand(rightOperand);

      return interpolate(sentence as string, {
        rightOperand: listToString(rightOperands),
      });
    }

    sentence =
      (getSentence(leftOperand) as string) ??
      listToString(await getLabelsFromIRI(leftOperand)) ??
      leftOperand;
    sentence += " ";
    sentence +=
      (getSentence(operator) as string) ??
      listToString(await getLabelsFromIRI(operator)) ??
      operator;
    sentence += " ";
    sentence += listToString(await this.#translateRightOperand(rightOperand));

    return sentence as string;
  }

  async #translateRightOperand(
    rightOperand: Array<any>
  ): Promise<Array<string | number>> {
    return await Promise.all(
      rightOperand.map(async ({ value, dataType }) => {
        if (dataType && dataType === XSD("duration").value) {
          return parseXSDDuration(value);
        }

        if (typeof value === "string") {
          if (isValidUrl(value)) {
            return (
              (getSentence(value) as string) ?? (await getLabelsFromIRI(value))
            );
          }
        }

        return value;
      })
    );
  }

  async #translateDuty(duty: ReturnType<Duty["toJSON"]>, parentId?: string) {
    const { actions, constraints, consequences, functions, targets, outputs } =
      duty;

    for (const action of actions) {
      const actionRefinements = [];

      let sentence = "Obligation to ";
      sentence += await this.#translateAction(action, duty);

      for (const refinement of action.refinements) {
        actionRefinements.push(await this.#translateConstraint(refinement));
      }

      if (parentId) {
        this.#translations.permissions[parentId].duties[duty.id].actions.push({
          sentence: sentence,
          refinements: actionRefinements,
        });
      } else {
        this.#translations.obligations[duty.id].actions.push({
          sentence: sentence,
          refinements: actionRefinements,
        });
      }
    }

    for (const consequence of consequences) {
      if (
        !(
          consequence.id in this.#translations.obligations[duty.id].consequences
        )
      ) {
        this.#translations.obligations[duty.id].consequences[consequence.id] = {
          actions: [],
          consequences: {},
          constraints: [],
        };
      }

      this.#translateDuty(consequence, duty.id);
    }

    for (const constraint of constraints) {
      if (parentId) {
        this.#translations.permissions[parentId].duties[
          duty.id
        ].constraints.push(await this.#translateConstraint(constraint));
      } else {
        this.#translations.obligations[duty.id].constraints.push(
          await this.#translateConstraint(constraint)
        );
      }
    }
  }
}
