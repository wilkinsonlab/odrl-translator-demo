<script setup lang="ts">
import type {
  Action,
  Rule,
  Target,
  Assignee,
  Constraint,
  RightOperandValueType
} from "../types";

import { ref, reactive, watch, unref } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import useGetRandomID from "../composables/useGetRandomID";
import usePolicy from "../composables/usePolicy";
import leftOperands from "../shared/leftOperands";
import operators from "../shared/operators";

const props = defineProps<{
  additionalData?: Record<string, any>;
}>();
const initialConstraint = defineModel<Constraint>("constraint");
const parentConstraints = defineModel<Array<Constraint>>("parentConstraints", {
  required: true
});

const valueTypes = ["iri", "date", "dateTime", "string", "float", "duration"];

const leftOperand = ref(initialConstraint?.value?.left_operand);
const operator = ref(initialConstraint?.value?.operator);
const valueType = ref(initialConstraint?.value?.valueType ?? "iri");
const rightOperand = ref(
  initialConstraint?.value
    ? (initialConstraint.value[
        `right_operand_value_${valueType.value as RightOperandValueType}`
      ] as RightOperandValueType)
    : undefined
);
const unit = ref(initialConstraint?.value?.unit);

if (initialConstraint?.value) {
  initialConstraint.value.left_operand = leftOperand;
  initialConstraint.value.operator = operator;
  initialConstraint.value.unit = unit;
  initialConstraint.value.valueType = valueType;
  initialConstraint.value[
    `right_operand_value_${valueType.value as RightOperandValueType}`
  ] = rightOperand;
}

const constraint = reactive(
  unref(initialConstraint) ?? {
    id: useGetRandomID(),
    policy_id: usePolicy().policy.id,
    left_operand: leftOperand,
    operator,
    valueType,
    right_operand_value_iri: null,
    right_operand_value_string: null,
    right_operand_value_duration: null,
    right_operand_value_date: null,
    right_operand_value_dateTime: null,
    right_operand_value_float: null,
    unit,
    ...(props.additionalData ? props.additionalData : {})
  }
);

watch(
  [leftOperand, operator, rightOperand],
  ([newLeftOperand, newOperator, newRightOperand]) => {
    const index = parentConstraints.value.findIndex(
      (_constraint: any) => _constraint.id === constraint.id
    );

    if (index < 0) {
      if (newLeftOperand && newOperator && newRightOperand != null) {
        parentConstraints.value.push(constraint);

        constraint[`right_operand_value_${valueType.value}`] = rightOperand;
      }
    } else {
      if (
        !newLeftOperand ||
        !newOperator ||
        newRightOperand === null ||
        newRightOperand === ""
      ) {
        parentConstraints.value.splice(index, 1);
      }
    }
  }
);

watch(valueType, (newValueType, previousValueType) => {
  if (newValueType !== previousValueType) {
    constraint[`right_operand_value_${newValueType}`] = rightOperand;

    delete constraint[`right_operand_value_${previousValueType}`];

    constraint[`right_operand_value_${previousValueType}`] = null;
  }
});
</script>

<template>
  <p>
    <label>Left operand</label>
    <select v-model="leftOperand">
      <template v-for="(_leftOperand, index) in leftOperands" :key="index">
        <option :value="ODRL(_leftOperand).value">{{ _leftOperand }}</option>
      </template>
    </select>

    <label>Operator</label>
    <select v-model="operator">
      <template v-for="(_operator, index) in operators" :key="index">
        <option :value="ODRL(_operator).value">{{ _operator }}</option>
      </template>
    </select>

    <label>Value type</label>
    <select v-model="valueType">
      <template v-for="(type, index) in valueTypes" :key="index">
        <option :value="type">{{ type }}</option>
      </template>
    </select>

    <label>Right operand</label>
    <input type="text" v-model="rightOperand" />

    <label>Unit</label>
    <input type="text" v-model="unit" />
  </p>
</template>
