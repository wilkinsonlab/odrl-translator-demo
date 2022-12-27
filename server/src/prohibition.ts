import * as $rdf from "rdflib";

import { RuleType } from "./enums.js";
import { ODRL } from "./namespaces.js";
import Rule from "./rule.js";
import Duty from "./duty.js";

export default class Prohibition extends Rule {
  #remedies: Array<Duty> = [];

  constructor(kb: $rdf.Formula, statement: $rdf.Statement) {
    super(kb, statement, RuleType.PROHIBITION);

    this.#setRemedies();
  }

  public get remedies() {
    return this.#remedies;
  }

  #setRemedies() {
    const remedies = this.statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("remedy"))
      .execute();

    if (remedies && remedies.length > 0) {
      remedies.forEach((remedy) => {
        this.#remedies.push(new Duty(this.kb, remedy));
      });
    }
  }
}
