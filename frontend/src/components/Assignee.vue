<script setup lang="ts">
import type { Rule, Duty } from "../types";

import { watch } from "vue";

import { useAssignee, type Props }from "../composables/useAssignee"

import { ODRL } from "../../../server/src/namespaces";
import partyTypes from "../shared/partyTypes";

const props = withDefaults(defineProps<Props>(), {
  allowRefinements: true
})

const {
    partyType,
    uri,
    refinements,
    assignee,
    addRefinement,
    removeRefinement,
    additionalData
  } = useAssignee(props)

  watch(
  [uri],
  ([newURI]) => {
    const parent = props.parent
    const index = parent.assignees.findIndex(
      (_assignee: any) => _assignee.id === assignee.id
    );

    if (index < 0) {
      if (newURI) {
        parent.assignees.push(assignee as any)
      }
    } else {
      if (
        newURI == null ||
        newURI === ""
      ) {
        parent.assignees.splice(index, 1);
      }
    }
  }
);
</script>

<template>
  <p>
    <label>Type</label>
    <select v-model="partyType">
      <template v-for="(type, index) in partyTypes" :key="index">
        <option :value="ODRL(type).value">{{ type }}</option>
      </template>
    </select>

    <label>URI</label>
    <input v-model="uri" />
  </p>

  <p>
    <h3>Refinements</h3>

    <ul>
      <li v-for="(refinement, index) in refinements" :key="refinement.name">
        <h4>Refinement {{ index + 1 }} <span @click="removeRefinement(index)" class="remove">X</span></h4>
        <component :is="refinement" :parent="assignee" :additionalData="additionalData" constraintKey="refinements"></component>
      </li>
      <li class="green no-list-style" @click="addRefinement">+ Add {{ parentType }} assignee refinement</li>
    </ul>
  </p>
</template>
