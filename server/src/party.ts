import * as $rdf from "rdflib";

import { ODRL, RDF } from "./namespaces.js";
import { isValidUrl } from "./utils.js";
import StatementsMatcher from "./statements_matcher.js";
import PartyCollection from "./party_collection";
import Policy from "./policy.js";
import Constraint from "./constraint.js";

export default class Party {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  #uid: string;

  #types: Array<$rdf.Statement> = [];

  #sources: Array<string>;

  #partOf?: PartyCollection;

  #assigneeOf?: Policy;

  #assignerOf?: Policy;

  #refinements?: Array<Constraint>;

  /**************************** CONSTRUCTOR *****************************/

  constructor(protected kb: $rdf.Formula, protected statement: $rdf.Statement) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setType();
    this.#setSources();
  }

  /****************************** GETTERS ******************************/

  public get types() {
    return this.#types;
  }

  public get sources() {
    return this.#sources;
  }

  /****************************** METHODS ******************************/

  #setType() {
    const result = this.#statementsMatcher
      .subject(this.statement.object)
      .predicate(RDF("type"))
      .execute();

    if (result && result.length > 0) {
      this.#types = result;
    }
  }

  #setSources() {
    const object = this.statement.object;
    const nextTriple = this.#statementsMatcher.subject(object).execute();

    // The object's value can be a subject for another triple.
    if (!nextTriple && isValidUrl(this.statement.object.value)) {
      this.#sources = [this.statement.object.value];
    } else {
      const sources = this.#statementsMatcher
        .subject(this.statement.object)
        .predicate(ODRL("source"))
        .execute();

      if (sources) {
        this.#sources = sources.map((source) => source.object.value);
      }
    }
  }
}
