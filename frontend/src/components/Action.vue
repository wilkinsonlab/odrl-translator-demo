<script setup lang="ts">
import type { Consequence, Duty, Rule } from "../types";

import { ref, reactive, markRaw, watch } from "vue";
import { ODRL } from "../../../server/src/namespaces";
import actions from "../shared/actions"

import { useAction, type Props } from "../composables/useAction";

const props = withDefaults(defineProps<Props>(), {
  allowRefinements: true
})

const {
  actionValue,
  refinements,
  action,
  addRefinement,
  removeRefinement,
  additionalData
} = useAction(props)
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

    <ul>
      <li v-for="(refinement, index) in refinements" :key="refinement.name">
        <h4>Refinement {{ index + 1 }} <span @click="removeRefinement(index)" class="remove">X</span></h4>
        <component :is="refinement" :parent="action" :additionalData="additionalData" constraintKey="refinements"></component>
      </li>
      <li class="green no-list-style" @click="addRefinement">+ Add {{ parentType }} action refinement</li>
    </ul>
  </p>
</template>
