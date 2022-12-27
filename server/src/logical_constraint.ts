import * as $rdf from "rdflib";

import { RDF, ODRL } from "./namespaces.js";
import { LogicalConstraintOperands } from "./enums.js";
import Exception from "./exception.js";
import StatementsMatcher from "./statements_matcher.js";
import Constraint from "./constraint.js";

export default class LogicalConstraint {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  #constraints: Map<`${LogicalConstraintOperands}`, Array<Constraint>>;

  /**************************** CONSTRUCTOR *****************************/

  constructor(private kb: $rdf.Formula, private statement: $rdf.Statement) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);
  }

  /****************************** GETTERS ******************************/

  public get constraints() {
    return this.#constraints;
  }

  /****************************** METHODS ******************************/

  async #setType() {
    for (const type of Object.values(LogicalConstraintOperands)) {
      const result = this.#statementsMatcher
        .subject(this.statement.object)
        .predicate(ODRL(type))
        .execute();

      if (result) {
        const constraints = [];
        let hasNext = true;

        /**
         * It's a list (@list), so we need to read each rdf#first &nd rdf#rest.
         */
        let currentConstraint = this.#statementsMatcher
          .subject(result[0].object)
          .predicate(RDF("first"))
          .execute();

        let nextConstraint = this.#statementsMatcher
          .subject(result[0].object)
          .predicate(RDF("rest"))
          .execute();

        do {
          if (currentConstraint) {
            constraints.push(currentConstraint[0]);
          }

          if (nextConstraint) {
            currentConstraint = this.#statementsMatcher
              .subject(nextConstraint[0].object)
              .predicate(RDF("first"))
              .execute();

            if (currentConstraint) {
              nextConstraint = this.#statementsMatcher
                .subject(currentConstraint[0].object)
                .predicate(RDF("rest"))
                .execute();
            }
          }

          /**
           * If the next next constraint triple predicate == rdf#rest and object == rdf#nil, then we stop the loop.
           */
          hasNext =
            (nextConstraint && nextConstraint[0].object === RDF("nil")) !==
            false;
        } while (hasNext);

        this.#constraints.set(
          type,
          constraints.map((constraint) => new Constraint(this.kb, constraint))
        );
      }
    }
  }
}
