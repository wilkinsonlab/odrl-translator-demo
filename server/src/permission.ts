import * as $rdf from "rdflib";

import Rule from "./rule.js";
import { RuleType } from "./enums.js";
import { ODRL } from "./namespaces.js";
import Duty from "./duty.js";
import Constraint from "./constraint.js";

export default class Permission extends Rule {
  /**************************** ATTRIBUTES *****************************/

  /**
   * List of the duty's constraints.
   */
  #constraints: Array<Constraint> = [];

  /**
   * List of the permission's duties.
   */
  #duties: Array<Duty> = [];

  /**************************** CONSTRUCTOR *****************************/

  constructor(kb: $rdf.Formula, statement: $rdf.Statement) {
    super(kb, statement, RuleType.PERMISSION);

    this.#setConstraints();
    this.#setDuties();
  }

  /****************************** GETTERS ******************************/

  get constraints() {
    return this.#constraints;
  }

  get duties() {
    return this.#duties;
  }

  /****************************** METHODS ******************************/

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

  #setDuties() {
    const duties = this.statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("duty"))
      .execute();

    if (duties && duties.length > 0) {
      duties.forEach((duty) => {
        this.#duties.push(new Duty(this.kb, duty));
      });
    }
  }
}
