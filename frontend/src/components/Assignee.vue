<script setup lang="ts">
import type { Rule, Duty, Assignee, Consequence } from "../types";

import { watch } from "vue";

import { useAssignee, type Props }from "../composables/useAssignee"

import { ODRL } from "../../../server/src/namespaces";
import partyTypes from "../shared/partyTypes";

const props = withDefaults(defineProps<Props>(), {
  allowRefinements: true
})
const initialAssignee = defineModel<Assignee>("assignee")
const parent = defineModel<Rule | Duty | Consequence>("parent", { required: true })

const {
    partyType,
    uri,
    assignee,
    additionalData
  } = useAssignee(props, parent, initialAssignee)

  /*watch(
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
);*/

watch(uri, (newURI) => {
  if (partyType.value === ODRL("Party").value) {
    assignee.source = null
    assignee.uid = newURI !== "" ? newURI : null
  } else {
    assignee.uid = null
    assignee.source = newURI !== "" ? newURI : null
  }
})

watch(partyType, (newType) => {
  if (newType === ODRL("Party").value) {
    assignee.uid = assignee.source
    assignee.source = null
  } else {
    assignee.source = assignee.uid
    assignee.uid = null
  }
})
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

    <group-constraints
      v-model:parent="assignee"
      v-model:constraints="assignee.refinements"
      parentType="assignee"
      :additionalData="additionalData"
    >
    </group-constraints>
  </p>
</template>
