import * as $rdf from "rdflib";

import Rule from "./rule.js";
import { RDF, ODRL, DCTERMS } from "./namespaces.js";
import { getSentenceOrLabel, isValidUrl } from "./utils.js";
import StatementsMatcher from "./statements_matcher.js";
import Constraint from "./constraint.js";

export default class Asset {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  #types: Array<string> = [];

  #urls: Array<string> = [];

  #title?: string;

  #refinements: Array<Constraint> = [];

  /**************************** CONSTRUCTOR *****************************/

  constructor(
    private kb: $rdf.Formula,
    private statement: $rdf.Statement,
    private rule: Rule
  ) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setTypes();
    this.#setURL();
    this.#setTitle();
    this.#setRefinements();
  }

  /****************************** GETTERS ******************************/

  public get types() {
    return this.#types;
  }

  public get urls() {
    return this.#urls;
  }

  public get iri() {
    return this.#getIRIStatement().object.value;
  }

  public get title() {
    return this.#title;
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

  #setTypes(): void {
    const statement = this.statement;

    if (this.isObject) {
      const result = this.#statementsMatcher
        .subject(statement.object)
        .predicate(RDF("type"))
        .execute();

      if (result) {
        result.forEach((type) => {
          this.#types.push(type.object.value);
        });
      }
    }
  }

  #setTitle(): void {
    const statement = this.statement;

    if (this.isObject) {
      const result = this.#statementsMatcher
        .subject(statement.object)
        .predicate(DCTERMS("title"))
        .execute();

      if (result) {
        this.#title = result[0].object.value;
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
        result.forEach((url) => {
          this.#urls.push(url.object.value.trim());
        });
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

  public toJSON() {
    return {
      id: this.statement.object.value,
      types: this.#types.map((type) => type),
      title: this.#title,
      urls: this.#urls,
      refinements: this.#refinements.map((refinement) => refinement.toJSON()),
    };
  }
}
