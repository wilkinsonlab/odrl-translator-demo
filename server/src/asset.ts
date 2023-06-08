import * as $rdf from "rdflib";

import Rule from "./rule.js";
import { RDF, ODRL } from "./namespaces.js";
import { getSentenceOrLabel, isValidUrl } from "./utils.js";
import StatementsMatcher from "./statements_matcher.js";
import Constraint from "./constraint.js";

export default class Asset {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  #type: string;

  #url: string;

  #refinements: Array<Constraint> = [];

  /**************************** CONSTRUCTOR *****************************/

  constructor(
    private kb: $rdf.Formula,
    private statement: $rdf.Statement,
    private rule: Rule
  ) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setType();
    this.#setURL();
    this.#setRefinements();
  }

  /****************************** GETTERS ******************************/

  public get type() {
    return this.#type;
  }

  public get url() {
    return this.#url;
  }

  public get iri() {
    return this.#getIRIStatement().object.value;
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
      await getSentenceOrLabel(this.#getIRIStatement(), this.kb)
    )[0].toLowerCase();
  }

  #setType(): void {
    const statement = this.statement;

    if (this.isObject) {
      const result = this.#statementsMatcher
        .subject(statement.object)
        .predicate(RDF("type"))
        .execute();

      if (result) {
        this.#type = result[0].object.value;
      }
    }
  }

  #setURL(): void {
    const statement = this.statement;

    if (this.isObject) {
      const result =
        this.#statementsMatcher
          .subject(statement.object)
          .predicate(ODRL("uid"))
          .execute() ??
        this.#statementsMatcher
          .subject(statement.object)
          .predicate(ODRL("source"))
          .execute();

      if (result) {
        this.#url = result[0].object.value;
      }
    }
  }

  /**
   * If the target(asset) is an object, get the object by its reference.
   * Otherwise, use the target(asset) as it is.
   */
  #getIRIStatement() {
    let statement = this.statement;

    if (this.isObject) {
      const result = this.#statementsMatcher
        .subject(statement.object)
        .predicate(ODRL("uid"))
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
        this.#refinements.push(new Constraint(this.kb, duty, this.rule));
      });
    }
  }
}
