import * as $rdf from "rdflib";

import { ODRL, RDF, VCARD } from "./namespaces.js";
import { isValidUrl } from "./utils.js";
import StatementsMatcher from "./statements_matcher.js";
import PartyCollection from "./party_collection";
import Policy from "./policy.js";
import Constraint from "./constraint.js";

export default class Party {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  #name?: string;

  #types: Array<$rdf.Statement> = [];

  #subTypes: Array<$rdf.Statement> = [];

  #values: Array<string> = [];

  #partOf?: PartyCollection;

  #assigneeOf?: Policy;

  #assignerOf?: Policy;

  #refinements?: Array<Constraint>;

  /**************************** CONSTRUCTOR *****************************/

  constructor(protected kb: $rdf.Formula, protected statement: $rdf.Statement) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setType();
    this.#setSubType();
    this.#setName();
    this.#setSources();
  }

  /****************************** GETTERS ******************************/

  public get types() {
    return this.#types;
  }

  public get name() {
    return this.#name;
  }

  public get values() {
    return this.#values;
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

  #setSubType() {
    const result = this.#statementsMatcher
      .subject(this.statement.subject)
      .predicate(undefined)
      .object(this.statement.object)
      .execute();

    if (result && result.length > 0) {
      this.#subTypes = result;
    }
  }

  #setName() {
    const result = this.#statementsMatcher
      .subject(this.statement.object)
      .predicate(VCARD("fn"))
      .execute();

    if (result && result.length > 0) {
      this.#name = result[0].object.value;
    }
  }

  #setSources() {
    const object = this.statement.object;
    const nextTriple = this.#statementsMatcher.subject(object).execute();

    // The object's value can be a subject for another triple.
    if (!nextTriple && isValidUrl(this.statement.object.value)) {
      this.#values = [this.statement.object.value];
    } else {
      const sources = this.#statementsMatcher
        .subject(this.statement.object)
        .predicate(ODRL("source"))
        .execute();

      if (sources) {
        this.#values = sources.map((source) => source.object.value);
      } else {
        const uids = this.#statementsMatcher
          .subject(this.statement.object)
          .predicate(ODRL("uid"))
          .execute();

        if (uids) {
          this.#values = uids.map((uid) => uid.object.value);
        }
      }
    }
  }

  public toJSON() {
    return {
      id: this.statement.object.value,
      types: this.#types.map((type) => type.object.value),
      subType: this.#subTypes.map((subType) => subType.predicate.value),
      name: this.#name,
      values: this.#values,
      //refinements: this.#refinements.map((refinement) => refinement.toJSON()),
    };
  }
}
