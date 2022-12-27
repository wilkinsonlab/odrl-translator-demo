import * as $rdf from "rdflib";

import { RDFS } from "./namespaces.js";

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

export function getLabel(statement: $rdf.Statement, kb: $rdf.Formula) {
  const result = kb.statementsMatching(
    statement?.object as any,
    RDFS("label"),
    undefined
  );

  return result && result.length > 0 ? result[0].object.value : null;
}
