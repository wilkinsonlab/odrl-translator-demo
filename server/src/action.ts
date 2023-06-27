import * as $rdf from "rdflib";

import Rule from "./rule.js";
import { RDF, ODRL } from "./namespaces.js";
import { getSentenceOrLabel, isValidUrl } from "./utils.js";
import StatementsMatcher from "./statements_matcher.js";
import Constraint from "./constraint.js";

export default class Action {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  #implies?: Array<Action>;

  #includedIn?: Action;

  #refinements: Array<Constraint> = [];

  /**************************** CONSTRUCTOR *****************************/

  constructor(
    private kb: $rdf.Formula,
    private statement: $rdf.Statement,
    private rule: Rule
  ) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setRefinements();
  }

  /****************************** GETTERS ******************************/

  public get iri() {
    return this.#getActionIRIStatement().object.value;
  }

  public get isObject() {
    if (isValidUrl(this.statement.object.value)) {
      const triples = this.#statementsMatcher
        .subject(this.statement.object)
        .predicate(undefined)
        .execute();

      return triples && triples.length > 0;
    }

    return false;
  }

  public get refinements() {
    return this.#refinements;
  }

  /****************************** METHODS ******************************/

  public async label(): Promise<string> {
    return (
      await getSentenceOrLabel(this.#getActionIRIStatement(), this.kb)
    )[0].toLowerCase();
  }

  /**
   * If the action is an object, get the object by its reference.
   * Otherwise, use the action as it is.
   */
  #getActionIRIStatement() {
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
      let isLogicalConstraint = false;

      // If it's a logical constraint.
      for (const logicalConstraintType of [
        "xone",
        "and",
        "or",
        "andSequence",
      ] as const) {
        const logicalConstraintStatement = this.#statementsMatcher
          .subject(refinements[0].object)
          .predicate(ODRL(logicalConstraintType))
          .execute();

        if (
          logicalConstraintStatement &&
          logicalConstraintStatement.length > 0
        ) {
          isLogicalConstraint = true;

          if (
            logicalConstraintStatement[0].subject.value ===
            refinements[0].object.value
          ) {
            const logicalConstraints =
              logicalConstraintStatement[0].object.elements;

            logicalConstraints.forEach((logicalConstraint) => {
              this.#refinements.push(
                new Constraint(
                  this.kb,
                  new $rdf.NamedNode(logicalConstraint.value),
                  this.rule
                )
              );
            });
          }
        }
      }

      if (!isLogicalConstraint) {
        refinements.forEach((refinement) => {
          this.#refinements.push(
            new Constraint(this.kb, refinement, this.rule)
          );
        });
      }
    }
  }

  public toJSON() {
    return {
      id: this.statement.object.value,
      iri: this.iri,
      refinements: this.#refinements.map((refinement) => refinement.toJSON()),
    };
  }
}
