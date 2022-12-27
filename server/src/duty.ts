import * as $rdf from "rdflib";

import { RuleType } from "./enums.js";

import Rule from "./rule.js";
import { ODRL } from "./namespaces.js";
import Constraint from "./constraint.js";

export default class Duty extends Rule {
  /**
   * List of the duty's constraints.
   */
  #constraints: Array<Constraint> = [];

  #consequences: Array<Duty> = [];

  constructor(kb: $rdf.Formula, statement: $rdf.Statement) {
    super(kb, statement, RuleType.DUTY);

    this.#setConstraints();
  }

  get constraints() {
    return this.#constraints;
  }

  #setConstraints() {
    const constraints = this.statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("constraint"))
      .execute();

    if (constraints && constraints.length > 0) {
      constraints.forEach((constraint) => {
        this.#constraints.push(new Constraint(this.kb, constraint));
      });
    }
  }
}
