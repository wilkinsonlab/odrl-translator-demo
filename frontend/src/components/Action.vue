<script setup lang="ts">
import type { Consequence, Duty, Rule, Action } from "../types";

import { ref, reactive, markRaw, watch, toRefs, toRef } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import actions from "../shared/actions"

import { useAction, type Props } from "../composables/useAction";

import GroupConstraints from "./GroupConstraints.vue";

const props = withDefaults(defineProps<Props>(), {
  allowRefinements: true
})
const initialAction = defineModel<Action>("action")
const parent = defineModel<Rule | Duty | Consequence>("parent", { required: true })

const {
  actionValue,
  action,
  additionalData
} = useAction(props, parent, initialAction)
</script>

<template>
  <p>
    <label>Action</label>
    <select v-model="actionValue">
      <template v-for="(action, index) in actions" :key="index">
        <option :value="ODRL(action).value">{{ action }}</option>
      </template>
    </select>
  </p>

  <p v-if="allowRefinements">
    <h3>Refinements</h3>

    <group-constraints
      v-model:parent="action"
      v-model:constraints="action.refinements"
      parentType="action"
      :additionalData="additionalData"
    >
    </group-constraints>
  </p>
</template>
