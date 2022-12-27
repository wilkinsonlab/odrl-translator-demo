import * as $rdf from "rdflib";

import Party from "./party.js";
import Constraint from "./constraint.js";

export default class PartyCollection extends Party {
  constructor(kb: $rdf.Formula, statement: $rdf.Statement) {
    super(kb, statement);
  }
}
