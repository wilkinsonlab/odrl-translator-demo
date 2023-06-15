import * as $rdf from "rdflib";

import { DCTERMS, ODRL, RDF } from "./namespaces.js";
import { Functions } from "./enums.js";
import { enumKeys } from "./utils.js";
import Permission from "./permission.js";
import Prohibition from "./prohibition.js";
import Duty from "./duty.js";
import StatementsMatcher from "./statements_matcher.js";

export default class Policy {
  /**************************** ATTRIBUTES *****************************/

  protected statementsMatcher: StatementsMatcher;

  protected _type: $rdf.Statement;

  protected uid: $rdf.NamedNode;

  protected profile: string;

  protected inheritFrom: Policy;

  protected conflict: any;

  protected _permissions: Array<Permission> = [];

  protected _prohibitions: Array<Prohibition> = [];

  protected _obligations: Array<Duty> = [];

  private creator: string | null = null;

  private issuedDate: string | null = null;

  /**
   * The common functions of the Policy.
   */
  protected _functions: Map<`${Functions}`, $rdf.Statement | undefined> =
    new Map();

  /**************************** CONSTRUCTOR *****************************/

  constructor(private kb: $rdf.Formula, uid: string) {
    this.statementsMatcher = new StatementsMatcher(this.kb);
    this.uid = new $rdf.NamedNode(uid);

    this.#setType();
    this.#setCreator();
    this.#setIssuedDate();
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

  #setType() {
    const result = this.statementsMatcher
      .subject(this.uid)
      .predicate(RDF("type"))
      .execute();

    if (result && result.length > 0) {
      this._type = result[0];
    }
  }

  #setCreator() {
    const result = this.statementsMatcher
      .subject(this.uid)
      .predicate(DCTERMS("creator"))
      .execute();

    if (result && result.length > 0) {
      this.creator = result[0].object.value;
    }
  }

  #setIssuedDate() {
    const result = this.statementsMatcher
      .subject(this.uid)
      .predicate(DCTERMS("issued"))
      .execute();

    if (result && result.length > 0) {
      this.issuedDate = result[0].object.value;
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

  public toJSON() {
    return {
      id: this.uid.value,
      type: this._type.object.value,
      creator: this.creator,
      issuedDate: this.issuedDate,
      permissions: this.permissions.map((permission) => permission.toJSON()),
      prohibitions: this.prohibitions.map((prohibition) =>
        prohibition.toJSON()
      ),
      obligations: this.obligations.map((obligation) => obligation.toJSON()),
    };
  }
}
