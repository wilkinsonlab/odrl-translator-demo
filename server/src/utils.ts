import * as $rdf from "rdflib";

import fetchIRI from "./fetch_iri.js";
import getSentence from "./sentences.js";
import { RDFS, SKOS } from "./namespaces.js";

export function isValidUrl(endpoint: string) {
  let url = null;

  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export function enumKeys<O extends object, K extends keyof O = keyof O>(
  obj: O
): K[] {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

export async function getLabels(
  statement: $rdf.Statement,
  kb: $rdf.Formula
): Promise<Array<string>> {
  const statementIRI = statement.object.value;
  const regex = new RegExp("dpv#", "g");
  const labelPredicate = statementIRI.match(regex)
    ? SKOS("prefLabel")
    : RDFS("label");
  let result;

  // Attempt to get the label from the current KB.
  result = kb.statementsMatching(
    statement?.object as any,
    labelPredicate,
    undefined
  );

  // Labels are not in the current KB, get them using their IRI.
  if (!result || result.length < 1) {
    result = (await fetchIRI(statementIRI))?.statementsMatching(
      $rdf.Namespace(statementIRI)(""),
      labelPredicate,
      undefined
    );
  }

  return result && result.length > 0
    ? result
        .map((_statement) => {
          let label = _statement.object.value;

          if (label.startsWith("has ")) {
            label = label.replace("has ", "");
          }

          return label;
        })
        /**
         * If the triple has multiple labels (s p o_1, o_2, ...o_n),
         * we filter the statements to remove the ones whose QNames include ":".
         */
        .filter((label) => !label.match(/^[a-zA-Z]+:[a-zA-Z]+$/g))
    : [];
}

export async function getSentenceOrLabel(
  statement: $rdf.Statement,
  kb: $rdf.Formula
): Promise<Array<string>> {
  const value = statement.object.value;
  const valueFromDictionary = getSentence(value) ? [getSentence(value)!] : null;

  return valueFromDictionary
    ? valueFromDictionary
    : (await getLabels(statement, kb)) ?? [value];
}

export function listToString(strings?: Array<string | undefined>) {
  if (strings && strings.length > 0) {
    return strings
      .filter((string) => string !== "") // Remove empty strings
      .join(", ") // Join the strings
      .replace(/, ([^,]*)$/, " and $1"); // Remove the last comma and replace it with conjunction
  }
}
