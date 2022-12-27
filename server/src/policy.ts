import * as $rdf from "rdflib";

import { ODRL, RDF } from "./namespaces.js";
import { Functions } from "./enums.js";
import { enumKeys } from "./utils.js";
import Permission from "./permission.js";
import Prohibition from "./prohibition.js";
import Duty from "./duty.js";
import StatementsMatcher from "./statements_matcher.js";

export default class Policy {
  /**************************** ATTRIBUTES *****************************/

  protected statementsMatcher: StatementsMatcher;

  protected _type: $rdf.Statement | undefined;

  protected uid: $rdf.NamedNode;

  protected profile: string;

  protected inheritFrom: Policy;

  protected conflict: any;

  protected _permissions: Array<Permission> = [];

  protected _prohibitions: Array<Prohibition> = [];

  protected _obligations: Array<Duty> = [];

  /**
   * The common functions of the Policy.
   */
  protected _functions: Map<`${Functions}`, $rdf.Statement | undefined> =
    new Map();

  /**************************** CONSTRUCTOR *****************************/

  constructor(private kb: $rdf.Formula) {
    this.statementsMatcher = new StatementsMatcher(this.kb);

    this.#setUID();
    this.#setType();
    this.#setFunctions();
    this.#setPermissions();
    this.#setProhibitions();
    this.#setObligations();
  }

  /****************************** GETTERS ******************************/

  public get type() {
    return this._type;
  }

  public get functions() {
    return this._functions;
  }

  public get permissions() {
    return this._permissions;
  }

  public get prohibitions() {
    return this._prohibitions;
  }

  public get obligations() {
    return this._obligations;
  }

  /****************************** METHODS ******************************/

  #setUID() {
    const allStatements = this.statementsMatcher
      .subject(undefined)
      .predicate(undefined)
      .object(undefined)
      .execute();

    if (allStatements && allStatements.length > 0) {
      this.uid = new $rdf.NamedNode(allStatements.at(-1)?.subject.value!);
    }
  }

  #setType() {
    const result = this.statementsMatcher
      .subject(this.uid)
      .predicate(RDF("type"))
      .execute();

    if (result && result.length > 0) {
      this._type = result[0];
    }
  }

  #setPermissions() {
    const permissions = this.statementsMatcher
      .subject(this.uid)
      .predicate(ODRL("permission"))
      .execute();

    if (permissions) {
      for (const permission of permissions) {
        this._permissions.push(new Permission(this.kb, permission));
      }
    }
  }

  #setProhibitions() {
    const prohibitions = this.statementsMatcher
      .subject(this.uid)
      .predicate(ODRL("prohibition"))
      .execute();

    if (prohibitions) {
      for (const prohibition of prohibitions) {
        this._prohibitions.push(new Prohibition(this.kb, prohibition));
      }
    }
  }

  #setObligations() {
    const obligations = this.statementsMatcher
      .subject(this.uid)
      .predicate(ODRL("obligation"))
      .execute();

    if (obligations) {
      for (const obligation of obligations) {
        this._obligations.push(new Duty(this.kb, obligation));
      }
    }
  }

  #setFunctions() {
    for (const key of enumKeys(Functions)) {
      const functionValue = Functions[key];
      const result = this.statementsMatcher
        .subject(this.uid)
        .predicate(ODRL(functionValue))
        .execute();

      if (result) {
        this._functions.set(functionValue, result[0]);
      }
    }
  }
}
