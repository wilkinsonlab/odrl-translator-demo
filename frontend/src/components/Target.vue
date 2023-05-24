<script setup lang="ts">
import type { Rule, Duty } from "../types";

import { watch } from "vue";

import { useTarget, type Props } from "../composables/useTarget";

import { ODRL } from "../../../server/src/namespaces";
import assetTypes from "../shared/assetTypes";

const props = withDefaults(defineProps<Props>(), {
  allowRefinements: true
})

const {
  assetType,
  uri,
  refinements,
  target,
  addRefinement,
  removeRefinement,
  additionalData
} = useTarget(props)

watch(
  [uri],
  ([newURI]) => {
    const parent = props.parent
    const index = parent.targets.findIndex(
      (_target: any) => _target.id === target.id
    );

    if (index < 0) {
      if (newURI) {
        parent.targets.push(target as any)
      }
    } else {
      if (
        newURI == null ||
        newURI === ""
      ) {
        parent.targets.splice(index, 1);
      }
    }
  }
);
</script>

<template>
  <p>
    <label>Type</label>
    <select v-model="assetType">
      <template v-for="(type, index) in assetTypes" :key="index">
        <option :value="ODRL(type).value">{{ type }}</option>
      </template>
    </select>
    <br />
    <label>URI</label>
    <input v-model="uri" />
  </p>

  <p>
    <ul>
      <li><h3>Refinements</h3></li>
      <ul>
        <li v-for="(refinement, index) in refinements" :key="refinement.name">
          <h4>Refinement {{ index + 1 }} <span @click="removeRefinement(index)" class="remove">X</span></h4>
          <component :is="refinement" :parent="target" :additionalData="additionalData" constraintKey="refinements"></component>
        </li>
        <li class="green no-list-style" @click="addRefinement">+ Add {{ parentType }} target refinement</li>
      </ul>
    </ul>
  </p>
</template>
