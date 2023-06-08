import * as $rdf from "rdflib";

import { RuleType, Functions } from "./enums.js";
import { ODRL } from "./namespaces.js";
import { enumKeys } from "./utils.js";
import Exception from "./exception.js";
import StatementsMatcher from "./statements_matcher.js";
import Action from "./action.js";
import Party from "./party.js";
import Asset from "./asset.js";

export default class Rule {
  /**************************** ATTRIBUTES *****************************/

  protected statementsMatcher: StatementsMatcher;

  /**
   * The unique ID of the rule.
   */
  protected uid?: string;

  /**
   * The actions of the rule.
   */
  protected _actions: Array<Action>;

  /**
   * The targets of the rule.
   */
  protected _targets?: Array<Asset>;

  /**
   * The output of the rule.
   */
  protected _output?: $rdf.Statement;

  /**
   * The functions of the rule.
   */
  protected _functions: Map<`${Functions}`, Party> = new Map();

  /**************************** CONSTRUCTOR *****************************/

  constructor(
    protected kb: $rdf.Formula,
    protected statement: $rdf.Statement,
    protected _type: RuleType
  ) {
    this.statementsMatcher = new StatementsMatcher(this.kb);

    this.#setActions();
    this.#setTargets();
    this.#setFunctions();
  }

  /****************************** GETTERS ******************************/

  public get targets() {
    return this._targets;
  }

  public get actions() {
    return this._actions;
  }

  public get functions() {
    return this._functions;
  }

  public get type() {
    return this._type;
  }

  /****************************** METHODS ******************************/

  public async getActionLabels() {
    const actionsLabels = [];

    for (const action of this._actions) {
      actionsLabels.push(await action.label());
    }

    return actionsLabels;
  }

  #setActions() {
    const result = this.statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("action"))
      .execute();

    if (result) {
      this._actions = result.map(
        (statement) => new Action(this.kb, statement, this)
      );
    } else {
      throw new Exception(
        `At least one action must be defined in the ${this.type}`,
        500,
        "E_NO_ACTION_DEFINED"
      );
    }
  }

  #setTargets() {
    const result = this.statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("target"))
      .execute();

    if (result) {
      this._targets = result.map(
        (statement) => new Asset(this.kb, statement, this)
      );
    } else {
      /**
       * If Rule is of type Duty, the target is optional.
       */
      if (this.type !== RuleType.DUTY) {
        throw new Exception(
          `A target property must be defined in the ${this.type}`,
          500,
          "E_NO_TARGET_DEFINED"
        );
      }
    }
  }

  #setFunctions() {
    for (const key of enumKeys(Functions)) {
      const functionValue = Functions[key];
      const result = this.statementsMatcher
        .subject(this.statement.object)
        .predicate(ODRL(functionValue))
        .execute();

      if (result) {
        this._functions.set(functionValue, new Party(this.kb, result[0]));
      }
    }
  }
}
