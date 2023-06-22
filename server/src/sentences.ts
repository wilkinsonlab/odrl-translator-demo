import { interpolate } from "@poppinss/utils/build/helpers.js";

import { ODRL, XSD, OCCE, OBO, DPV, CC, SWO } from "./namespaces.js";
import numericTypes from "./numeric_types.js";
import dateTypes from "./date_types.js";
import { isValidUrl } from "./utils.js";

export default function getSentence(
  key: string,
  args?: Record<string, any>
): string | undefined {
  const sentences: Record<string, unknown> = {
    [ODRL("Policy").value]:
      "This is a policy {{ creator }} {{ issued }} that assigns rules that apply generically",
    [ODRL("Set").value]:
      "This is a policy {{ creator }} {{ issued }} that assigns rules that apply generically",
    [ODRL("Offer").value]:
      "This is a policy {{ creator }} {{ issued }} where rules are assigned by individuals or organizations and applied generically",
    [ODRL("Agreement").value]:
      "This is a policy {{ creator }} {{ issued }} where rules are assigned by individuals or organizations and applied to specific another individuals or organizations",
    [`${ODRL("purpose").value}.${ODRL("isA").value}`]:
      "Purpose must be {{ rightOperand }}",
    [`${ODRL("share").value}.${DPV("Context").value}`]:
      "share {{ rightOperand }} with {{ sharedParty }}",
    [`${ODRL("share").value}.${ODRL("recipient").value}`]:
      "{{ rightOperand }} must be the recipient of the sharing",
    [ODRL("obtainConsent").value]: "obtain consent",
    [CC("Attribution").value]: "Acknowledge",
    [ODRL("Attribution").value]: "Acknowledge",
    [OBO("NCIT_C73529").value]: "Collaborate",
    [OBO("NCIT_C19026").value]: "Publish a Scientific Publication",
    [OBO("NCIT_C64950").value]: "Adhere to",
    ["http://schema.org/RegisterAction"]: "Register",
    ["http://edamontology.org/format_1915"]: "Data format",
    [`${ODRL("purpose").value}.${ODRL("isAllOf").value}`]:
      "Purpose must be all of {{ rightOperand }}",
    [`${ODRL("payAmount").value}.${ODRL("eq").value}`]:
      "Pay an amount equal to",
    [`${OBO("NCIT_C25548").value}.${ODRL("isA").value}`]:
      "{{ rightOperand }} must be involved",
    [`${OBO("NCIT_C25548").value}.${ODRL("isNoneOf").value}`]:
      "{{ rightOperand }} not be involved",
    [`${OBO("NCIT_C64950").value}.${ODRL("isA").value}`]:
      "Must adhere to {{ rightOperand }}",
    [`${OBO("NCIT_C64950").value}.${ODRL("isNoneOf").value}`]:
      "Must not adhere to {{ rightOperand }}",
    [`${OBO("NCIT_C64950").value}.${ODRL("isAllOf").value}`]:
      "Must adhere to {{ rightOperand }}",
    [`${OBO("NCIT_C42615").value}.${ODRL("isA").value}`]:
      "Must be approved by {{ rightOperand }}",
    [`${OBO("NCIT_C42615").value}.${ODRL("isNoneOf").value}`]:
      "Must not be approved by {{ rightOperand }}",
    [OBO("T4FS_0000501").value]: "de-anonymize",
    [ODRL("grantUse").value]: "grant the use to",
    [ODRL("use").value]: "use",
    [ODRL("policyUsage").value]: "the rule is exercised",
    [ODRL("isA").value]: "must be",
    [ODRL("lt").value]: "must be lesser than",
    [ODRL("lteq").value]: "must be lesser than or equal to",
    [ODRL("eq").value]: "must be equal to",
    [ODRL("neq").value]: "must not be equal to",
    [ODRL("gt").value]: "must be greater than",
    [ODRL("gteq").value]: "must be greater than or equal to",
    [ODRL("isAllOf").value]: "must be all of",
    [ODRL("isNoneOf").value]: "must not be any of",
    [`${ODRL("event").value}.${ODRL("lt").value}`]:
      "Must happen before {{ rightOperand }}",
    [`${ODRL("event").value}.${ODRL("lteq").value}`]:
      "Must happen before or during {{ rightOperand }}",
    [`${ODRL("event").value}.${ODRL("eq").value}`]:
      "Must happen during {{ rightOperand }}",
    [`${ODRL("event").value}.${ODRL("neq").value}`]:
      "Must not happen during {{ rightOperand }}",
    [`${ODRL("event").value}.${ODRL("gt").value}`]:
      "Must happen after {{ rightOperand }}",
    [`${ODRL("event").value}.${ODRL("gteq").value}`]:
      "Must happen during or after {{ rightOperand }}",
    [`${ODRL("duty").value}.${ODRL("event").value}.${ODRL("lt").value}`]:
      "Must be fulfilled before {{ rightOperand }}",
    [`${ODRL("duty").value}.${ODRL("event").value}.${ODRL("lteq").value}`]:
      "Must be fulfilled before or during {{ rightOperand }}",
    [`${ODRL("duty").value}.${ODRL("event").value}.${ODRL("eq").value}`]:
      "Must be fulfilled during {{ rightOperand }}",
    [`${ODRL("duty").value}.${ODRL("event").value}.${ODRL("neq").value}`]:
      "Must not be fulfilled during {{ rightOperand }}",
    [`${ODRL("duty").value}.${ODRL("event").value}.${ODRL("gt").value}`]:
      "Must be fulfilled after {{ rightOperand }}",
    [`${ODRL("duty").value}.${ODRL("event").value}.${ODRL("gteq").value}`]:
      "Must be fulfilled during or after {{ rightOperand }}",
    [`${ODRL("percentage").value}.${ODRL("lt").value}`]:
      "percentage must be less than",
    [`${ODRL("percentage").value}.${ODRL("lteq").value}`]:
      "percentage must be less than or equal to",
    [`${ODRL("percentage").value}.${ODRL("eq").value}`]:
      "percentage must be equal to",
    [`${ODRL("percentage").value}.${ODRL("neq").value}`]:
      "percentage must be different from",
    [`${ODRL("percentage").value}.${ODRL("gt").value}`]:
      "percentage must be greater than",
    [`${ODRL("percentage").value}.${ODRL("gteq").value}`]:
      "percentage must be equal to or greater than",
    [`${ODRL("recipient").value}.${ODRL("eq").value}`]: "with",
    [`${ODRL("recipient").value}.${ODRL("neq").value}`]: "with all except",
    [`${XSD("time").value}.${ODRL("lt").value}`]: "before",
    [`${XSD("time").value}.${ODRL("lteq").value}`]: "before/at",
    [`${XSD("time").value}.${ODRL("eq").value}`]: "at",
    [`${XSD("time").value}.${ODRL("neq").value}`]: "not at",
    [`${XSD("time").value}.${ODRL("gt").value}`]: "after",
    [`${XSD("time").value}.${ODRL("gteq").value}`]: "from",
    [`${ODRL("timeInterval").value}.${ODRL("eq").value}`]:
      "The recurring period of time before the next execution of the {{ action }} of the {{ rule }} is",
    [`${ODRL("delayPeriod").value}.${ODRL("eq").value}`]:
      "The time delay period prior to exercising the {{ action }} of the {{ rule }} is",
    [`${ODRL("delayPeriod").value}.${ODRL("gt").value}`]:
      "The time delay period prior to exercising the {{ action }} of the {{ rule }} is superior to",
    [`${ODRL("delayPeriod").value}.${ODRL("gteq").value}`]:
      "The time delay period prior to exercising the {{ action }} of the {{ rule }} is superior or equal to",
    [`${XSD("string").value}.${ODRL("eq").value}`]: "a",
    [`${XSD("string").value}.${ODRL("neq").value}`]: "different from",

    [OCCE("collaborate").value]: "collaborate with",
    [OCCE("negotiate").value]: "negotiate",
    [SWO("SWO_1000136").value]: "Commercial use",
    [OCCE("duration").value]: "duration",
    [OCCE("useAsReference").value]: "use as reference",
  } as const;

  numericTypes.forEach((type) => {
    sentences[`${XSD(type).value}.${ODRL("lt").value}`] = "must be lesser than";
    sentences[`${XSD(type).value}.${ODRL("lteq").value}`] =
      "must be lesser than or equal to";
    sentences[`${XSD(type).value}.${ODRL("eq").value}`] = "must be equal to";
    sentences[`${XSD(type).value}.${ODRL("neq").value}`] =
      "must be different from";
    sentences[`${XSD(type).value}.${ODRL("gt").value}`] =
      "must be greater than";
    sentences[`${XSD(type).value}.${ODRL("gteq").value}`] =
      "must be greater than or equal to";
  });

  dateTypes.forEach((type) => {
    sentences[`${XSD(type).value}.${ODRL("lt").value}`] = "before";
    sentences[`${XSD(type).value}.${ODRL("lteq").value}`] = "before/on";
    sentences[`${XSD(type).value}.${ODRL("eq").value}`] = "on";
    sentences[`${XSD(type).value}.${ODRL("neq").value}`] = "different from";
    sentences[`${XSD(type).value}.${ODRL("gt").value}`] = "after";
    sentences[`${XSD(type).value}.${ODRL("gteq").value}`] = "from";
  });

  const sentence = sentences[key];

  /*return typeof sentence === "string"
    ? interpolate(sentence, args)
    : (sentence as any);*/

  return sentence as string;
}
