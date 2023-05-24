<script setup lang="ts">
import type { Action, Rule, Target, Assignee } from "../types";

import { ref, reactive, watch, unref } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import useGetRandomID from "../composables/useGetRandomID";
import leftOperands from "../shared/leftOperands";
import operators from "../shared/operators";

const props = defineProps<{
  parent: Target | Action | Assignee | Rule;
  constraintKey: string;
  additionalData?: Record<string, any>;
}>();

const valueTypes = ["iri", "date", "dateTime", "string", "float", "duration"];

const leftOperand = ref();
const operator = ref();
const valueType = ref<
  "iri" | "date" | "dateTime" | "string" | "float" | "duration"
>("iri");
const rightOperand = ref();
const unit = ref(null);

const constraint = reactive({
  id: useGetRandomID(),
  policy_id: props.parent.policy_id,
  ...(props.additionalData ? props.additionalData : {}),
  left_operand: leftOperand,
  operator,
  right_operand_value_iri: null,
  right_operand_value_string: null,
  right_operand_value_duration: null,
  right_operand_value_date: null,
  right_operand_value_dateTime: null,
  right_operand_value_float: null,
  unit
});

watch(
  [leftOperand, operator, rightOperand],
  ([newLeftOperand, newOperator, newRightOperand]) => {
    const index = props.parent[props.constraintKey].findIndex(
      (_constraint: any) => _constraint.id === constraint.id
    );

    if (index < 0) {
      if (newLeftOperand && newOperator && newRightOperand != null) {
        // @ts-ignore
        props.parent[props.constraintKey].push(constraint);

        constraint[`right_operand_value_${valueType.value}`] = rightOperand;
      }
    } else {
      if (
        !newLeftOperand ||
        !newOperator ||
        newRightOperand === null ||
        newRightOperand === ""
      ) {
        // @ts-ignore
        props.parent[props.constraintKey].splice(index, 1);
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
