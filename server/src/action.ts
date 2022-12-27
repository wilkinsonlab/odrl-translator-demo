import * as $rdf from "rdflib";

import { RDF, ODRL } from "./namespaces.js";
import { getLabel } from "./utils.js";
import getSentence from "./sentences.js";
import StatementsMatcher from "./statements_matcher.js";
import Constraint from "./constraint.js";

export default class Action {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  #implies?: Array<Action>;

  #includedIn?: Action;

  #refinements: Array<Constraint> = [];

  /**************************** CONSTRUCTOR *****************************/

  constructor(private kb: $rdf.Formula, private statement: $rdf.Statement) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setRefinements();
  }

  /****************************** GETTERS ******************************/

  public get label() {
    return (
      getLabel(this.#getActionURIStatement(), this.kb) || getSentence(this.uri)
    );
  }

  public get uri() {
    return this.#getActionURIStatement().object.value;
  }

  public get isObject() {
    const regex = new RegExp("\\_\\:b\\d+");

    return regex.test(this.statement.object.value);
  }

  public get refinements() {
    return this.#refinements;
  }

  /****************************** METHODS ******************************/

  /**
   * If the action is an object, get the object by its reference.
   * Otherwise, use the action as it is.
   */
  #getActionURIStatement() {
    let statement = this.statement;

    if (this.isObject) {
      const result = this.#statementsMatcher
        .subject(this.statement.object)
        .predicate(RDF("value"))
        .execute();

      if (result) {
        statement = result[0];
      }
    }

    return statement;
  }

  #setRefinements() {
    const refinements = this.#statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("refinement"))
      .execute();

    if (refinements && refinements.length > 0) {
      refinements.forEach((duty) => {
        this.#refinements.push(new Constraint(this.kb, duty));
      });
    }
  }
}
