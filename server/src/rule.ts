import * as $rdf from "rdflib";

import { RuleType, Functions } from "./enums.js";
import { DCE, DCTERMS, OCCE, ODRL } from "./namespaces.js";
import { enumKeys } from "./utils.js";
import Exception from "./exception.js";
import StatementsMatcher from "./statements_matcher.js";
import Action from "./action.js";
import Party from "./party.js";
import Asset from "./asset.js";
import Constraint from "./constraint.js";
import cces from "./cces.js";

export default class Rule {
  /**************************** ATTRIBUTES *****************************/

  protected statementsMatcher: StatementsMatcher;

  /**
   * The unique ID of the rule.
   */
  protected uid?: string;

  /**
   * The CCE rule.
   */
  protected _cce: keyof typeof cces;

  /**
   * The rule coverage.
   */
  protected _coverage: string | null = null;

  /**
   * The actions of the rule.
   */
  protected _actions: Array<Action>;

  /**
   * The targets of the rule.
   */
  protected _targets: Array<Asset> = [];

  /**
   * The output of the rule.
   */
  protected _outputs: Array<Asset> = [];

  /**
   * The functions of the rule.
   */
  protected _functions: Map<`${Functions}`, Party> = new Map();

  /**
   * List of the duty's constraints.
   */
  protected _constraints: Array<Constraint> = [];

  /**************************** CONSTRUCTOR *****************************/

  constructor(
    protected kb: $rdf.Formula,
    protected statement: $rdf.Statement,
    protected _type: RuleType
  ) {
    this.statementsMatcher = new StatementsMatcher(this.kb);

    this.#setCCE();
    this.#setCoverage();
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

  public get cce() {
    return this._cce;
  }

  /****************************** METHODS ******************************/

  public async getActionLabels() {
    const actionsLabels = [];

    for (const action of this._actions) {
      actionsLabels.push(await action.label());
    }

    return actionsLabels;
  }

  #setCCE() {
    const result = this.statementsMatcher
      .subject(this.statement.object)
      .predicate(DCE("subject"))
      .execute();

    if (result) {
      this._cce = result[0].object.value as keyof typeof cces;
    }
  }

  #setCoverage() {
    const result = this.statementsMatcher
      .subject(this.statement.object)
      .predicate(DCTERMS("coverage"))
      .execute();

    if (result) {
      this._coverage = result[0].object.value;
    }
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
        `At least one action must be defined in the ${this.type} - ${this.statement.object.value}`,
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
          `A target property must be defined in the ${this.type} - ${this.statement.object.value}`,
          500,
          "E_NO_TARGET_DEFINED"
        );
      }
    }
  }

  #setFunctions() {
    for (const key of enumKeys(Functions)) {
      const functionValue = Functions[key];
      const odrlFunctions = this.statementsMatcher
        .subject(this.statement.object)
        .predicate(ODRL(functionValue))
        .execute();

      const occeFunctions = this.statementsMatcher
        .subject(this.statement.object)
        .predicate(OCCE(functionValue))
        .execute();

      if (odrlFunctions) {
        this._functions.set(
          functionValue,
          new Party(this.kb, odrlFunctions[0])
        );
      }

      if (occeFunctions) {
        this._functions.set(
          functionValue,
          new Party(this.kb, occeFunctions[0])
        );
      }
    }
  }

  public toJSON() {
    const initialFunctions: Record<
      `${Functions}`,
      Array<ReturnType<Party["toJSON"]>>
    > = Array.from(Object.values(Functions)).reduce(
      (functions: any, currentFunction) => {
        functions[currentFunction] = [];

        return functions;
      },
      {}
    );

    const functions = Array.from(this._functions.entries()).reduce<
      Record<`${Functions}`, Array<ReturnType<Party["toJSON"]>>>
    >((_functions, [_function, party]) => {
      _functions[_function].push(party.toJSON());

      return _functions;
    }, initialFunctions);

    return {
      id: this.statement.object.value,
      cce: this._cce,
      coverage: this._coverage,
      functions,
      actions: this._actions.map((action) => action.toJSON()),
      targets: this._targets.map((target) => target.toJSON()),
      outputs: this._outputs.map((target) => target.toJSON()),
      constraints: this._constraints.map((constraint) => constraint.toJSON()),
    };
  }
}
