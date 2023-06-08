import { interpolate } from "@poppinss/utils/build/helpers.js";

import { ODRL, XSD, OCCE } from "./namespaces.js";
import numericTypes from "./numeric_types.js";
import dateTypes from "./date_types.js";
import { isValidUrl } from "./utils.js";

export default function getSentence(
  key: string,
  args?: Record<string, string>
) {
  if (!isValidUrl(key)) {
    return;
  }

  const sentences: Record<string, unknown> = {
    [ODRL("Policy").value]:
      "This is a policy that assigns rules that apply generically",
    [ODRL("Set").value]:
      "This is a policy that assigns rules that apply generically",
    [ODRL("Offer").value]:
      "This is a policy where rules are assigned by individuals or organizations and applied generically",
    [ODRL("Agreement").value]:
      "This is a policy where rules are assigned by individuals or organizations and applied to specific another individuals or organizations",
    [ODRL("payAmount").value]: {
      [ODRL("eq").value]: "paying an amount equal to",
    },
    [ODRL("grantUse").value]: "grant the use to",
    [ODRL("policyUsage").value]: "the rule is exercised",
    [ODRL("isA").value]: "must be",
    [ODRL("lt").value]: "lesser than",
    [ODRL("lteq").value]: "lesser than or equal to",
    [ODRL("eq").value]: "equals to",
    [ODRL("neq").value]: "not equal to",
    [ODRL("gt").value]: "greater than",
    [ODRL("gteq").value]: "greater than or equal to",
    [ODRL("event").value]: {
      [ODRL("lt").value]: "must happen before",
      [ODRL("lteq").value]: "must happen before or while",
      [ODRL("eq").value]: "must happen while",
      [ODRL("neq").value]: "must not happen while",
      [ODRL("gt").value]: "must happen after",
      [ODRL("gteq").value]: "must happen while or after",
    },
    [ODRL("percentage").value]: {
      [ODRL("lt").value]: "percentage must be less than",
      [ODRL("lteq").value]: "percentage must be less than or equal to",
      [ODRL("eq").value]: "percentage must be equal to",
      [ODRL("neq").value]: "percentage must be different from",
      [ODRL("gt").value]: "percentage must be greater than",
      [ODRL("gteq").value]: "percentage must be equal to or greater than",
    },
    [ODRL("recipient").value]: {
      [ODRL("eq").value]: "with",
      [ODRL("neq").value]: "with all except",
    },
    [XSD("time").value]: {
      [ODRL("lt").value]: "before",
      [ODRL("lteq").value]: "before/at",
      [ODRL("eq").value]: "at",
      [ODRL("neq").value]: "not at",
      [ODRL("gt").value]: "after",
      [ODRL("gteq").value]: "from",
    },
    [ODRL("timeInterval").value]: {
      [ODRL("eq").value]:
        "The recurring period of time before the next execution of the {{ action }} of the {{ rule }} is",
    },
    [ODRL("delayPeriod").value]: {
      [ODRL("eq").value]:
        "The time delay period prior to exercising the {{ action }} of the {{ rule }} is",
      [ODRL("gt").value]:
        "The time delay period prior to exercising the {{ action }} of the {{ rule }} is superior to",
      [ODRL("gteq").value]:
        "The time delay period prior to exercising the {{ action }} of the {{ rule }} is superior or equal to",
    },
    [XSD("string").value]: {
      [ODRL("eq").value]: "a",
      [ODRL("neq").value]: "different from",
    },

    [OCCE("collaborate").value]: "collaborate with",
  } as const;

  numericTypes.forEach((type) => {
    sentences[XSD(type).value] = {
      [ODRL("lt").value]: "lesser than",
      [ODRL("lteq").value]: "lesser than or equal to",
      [ODRL("eq").value]: "equal to",
      [ODRL("neq").value]: "different from",
      [ODRL("gt").value]: "greater than",
      [ODRL("gteq").value]: "greater than or equal to",
    };
  });

  dateTypes.forEach((type) => {
    sentences[XSD(type).value] = {
      [ODRL("lt").value]: "before",
      [ODRL("lteq").value]: "before/on",
      [ODRL("eq").value]: "on",
      [ODRL("neq").value]: "different from",
      [ODRL("gt").value]: "after",
      [ODRL("gteq").value]: "from",
    };
  });

  const sentence = sentences[key];

  return typeof sentence === "string"
    ? interpolate(sentence, args)
    : (sentence as any);
}
