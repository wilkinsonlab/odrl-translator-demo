<script setup lang="ts">
import type {
  Action,
  Rule,
  Target,
  Assignee,
  Constraint as ConstraintContract
} from "../types";

import { watch } from "vue";

import {
  useGroupConstraints,
  type Props
} from "../composables/useGroupConstraints";

import { ODRL } from "../../../server/src/namespaces";

const props = defineProps<Props>();
const parent = defineModel<Rule | Action | Target | Assignee>("parent", {
  required: true
});
const initialConstraints =
  defineModel<Array<ConstraintContract>>("constraints");

const {
  constraintTypes,
  constraints,
  operands,
  type,
  operand,
  constraintsElement,
  addConstraint,
  removeConstraint
} = useGroupConstraints(props, parent, initialConstraints);

const constraintsKey = ["rule", "duty"].includes(props.parentType)
  ? "constraints"
  : "refinements";

watch(type, (newType, previousType) => {
  if (newType === ODRL("Constraint").value) {
    parent.value.first = null;
    parent.value.operand = null;

    if (previousType === ODRL("LogicalConstraint").value && operand.value) {
      parent.value.logical_constraints[operand.value] = [];
    }
  } else {
    if (operand.value) {
      parent.value.logical_constraints[operand.value] = Array.from(
        parent.value[constraintsKey]
      );
    }
  }
});

watch(operand, (newOperand, previousOperand) => {
  if (newOperand) {
    parent.value.logical_constraints[newOperand] = Array.from(
      previousOperand
        ? parent.value.logical_constraints[previousOperand]
        : parent.value[constraintsKey]
    );

    if (previousOperand && parent.value.logical_constraints[previousOperand]) {
      parent.value.logical_constraints[previousOperand] = [];
    }

    parent.value.operand = newOperand;
  }
});

watch(constraints, (newConstraints) => {
  if (newConstraints.length > 0) {
    if (type.value === ODRL("LogicalConstraint").value) {
      parent.value.first = newConstraints[0].id;
    }

    if (newConstraints.length > 1) {
      for (let i = 0; i < newConstraints.length; ++i) {
        if (newConstraints[i + 1]) {
          newConstraints[i].next = newConstraints[i + 1].id;
        } else {
          newConstraints[i].next = "null";
        }
      }
    } else {
      newConstraints[0].next = "null";
    }

    if (operand.value) {
      parent.value.logical_constraints[operand.value] =
        Array.from(newConstraints);
    }
  } else {
    parent.value.first = null;

    if (parent.value.logical_constraints[operand.value]) {
      parent.value.logical_constraints[operand.value!] = [];
    }
  }
});
</script>

<template>
  <p>
    <label>Type</label>
    <select v-model="type">
      <template v-for="(type, index) in constraintTypes" :key="index">
        <option :value="ODRL(type).value">{{ type }}</option>
      </template>
    </select>
  </p>

  <p v-if="type === ODRL('LogicalConstraint').value">
    <label>Operand</label>
    <select v-model="operand">
      <template v-for="(_operand, index) in operands" :key="index">
        <option :value="_operand">{{ _operand }}</option>
      </template>
    </select>
  </p>

  <ul>
    <li v-for="(constraint, index) in constraintsElement" :key="index">
      <h4>
        {{ parentType === "rule" ? "Constraint" : "Refinement" }}
        {{ index + 1 }}
        <span @click="removeConstraint(index)" class="remove">X</span>
      </h4>
      <component
        :is="constraint"
        v-model:constraint="constraints[index]"
        v-model:parentConstraints="constraints"
        :additionalData="additionalData"
        :constraintKey="
          ['rule', 'duty'].includes(parentType) ? 'constraints' : 'refinements'
        "
      ></component>
    </li>
    <li class="green no-list-style" @click="addConstraint">
      + Add {{ parentType }}
      {{ ["rule", "duty"].includes(parentType) ? "constraint" : "refinement" }}
    </li>
  </ul>
</template>
