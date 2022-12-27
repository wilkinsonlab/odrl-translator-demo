import * as $rdf from "rdflib";

import { ODRL } from "./namespaces.js";
import { getLabel } from "./utils.js";
import Exception from "./exception.js";
import StatementsMatcher from "./statements_matcher.js";

export default class Constraint {
  /**************************** ATTRIBUTES *****************************/

  #statementsMatcher: StatementsMatcher;

  /**
   * The unique ID of the constraint.
   */
  public uid: string | undefined;

  /**
   * The unit of the constraint.
   */
  #unit: $rdf.Statement | undefined;

  /**
   * The dataType of the constraint.
   */
  #dataType: $rdf.NamedNode;

  /**
   * The operator of the constraint.
   */
  #operator: $rdf.Statement;

  /**
   * The rightOperand of the constraint.
   */
  #rightOperand: $rdf.Statement;

  /**
   * The rightOperandReference of the constraint.
   */
  #rightOperandReference: $rdf.Statement | undefined;

  /**
   * The leftOperand of the constraint.
   */
  #leftOperand: $rdf.Statement;

  /**
   * The status of the constraint.
   */
  #status: $rdf.Statement | undefined;

  /**************************** CONSTRUCTOR *****************************/

  constructor(private kb: $rdf.Formula, private statement: $rdf.Statement) {
    this.#statementsMatcher = new StatementsMatcher(this.kb);

    this.#setLeftOperand();
    this.#setOperator();
    this.#setRightOperand();
    this.#setUnit();
  }

  /****************************** GETTERS ******************************/

  /**
   * Get the left operand of the constraint.
   *
   * @readonly
   * @memberof Constraint
   */
  public get leftOperand() {
    return this.#leftOperand;
  }

  /**
   * Get the label of the left operand.
   *
   * @readonly
   * @memberof Constraint
   */
  public get leftOperandLabel() {
    return getLabel(this.#leftOperand, this.kb);
  }

  /**
   * Get the operator of the constraint.
   *
   * @readonly
   * @memberof Constraint
   */
  public get operator() {
    return this.#operator;
  }

  /**
   * Get the right operand of the constraint.
   *
   * @readonly
   * @memberof Constraint
   */
  public get rightOperand() {
    return this.#rightOperand;
  }

  /**
   * Get the data type of the right operand.
   *
   * @readonly
   * @memberof Constraint
   */
  public get dataType() {
    return this.#dataType;
  }

  /**
   * Get the unit of the right operand.
   *
   * @readonly
   * @memberof Constraint
   */
  public get unit() {
    return this.#unit;
  }

  /****************************** METHODS ******************************/

  #setLeftOperand() {
    const leftOperand = this.#statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("leftOperand"))
      .execute();

    if (leftOperand) {
      this.#leftOperand = leftOperand[0];
    } else {
      throw new Exception(
        `A leftOperand property must be defined in the constraint`,
        500,
        "E_NO_LEFT_OPERAND_DEFINED"
      );
    }
  }

  #setOperator() {
    const operator = this.#statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("operator"))
      .execute();

    if (operator) {
      this.#operator = operator[0];
    } else {
      throw new Exception(
        `An operator property must be defined in the constraint`,
        500,
        "E_NO_OPERATOR_DEFINED"
      );
    }
  }

  #setRightOperand() {
    const rightOperand = this.#statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("rightOperand"))
      .execute();

    if (rightOperand) {
      this.#rightOperand = rightOperand[0];

      // @ts-ignore
      this.#dataType = this.#rightOperand.object.datatype;
    } else {
      throw new Exception(
        `A rightOperand property must be defined in the constraint`,
        500,
        "E_NO_RIGHT_OPERAND_DEFINED"
      );
    }
  }

  #setUnit() {
    const unit = this.#statementsMatcher
      .subject(this.statement.object)
      .predicate(ODRL("unit"))
      .execute();

    if (unit) {
      this.#unit = unit[0];
    }
  }
}
