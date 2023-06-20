<script setup lang="ts">
import { ref, reactive, markRaw, toValue } from "vue";
import { Steppy } from "vue3-steppy";
import { ODRL } from "../../../server/src/namespaces";
import PolicyRule from "../components/PolicyRule.vue";

import usePolicy from "../composables/usePolicy";

const step = ref(1);
const tabs = reactive([
  {
    title: "Policy description",
    isValid: true
  },
  {
    title: "Policy rules",
    isValid: true
  }
]);

const reference = ref(null);

const { policy, onDone, done, policies } = usePolicy();
const rules = ref(new Array(policy.rules.permissions.length + policy.rules.prohibitions.length + policy.rules.obligations.length + 1).fill(markRaw(PolicyRule)));

const initialArrayOfRules = [...policy.rules.permissions, ...policy.rules.prohibitions, ...policy.rules.obligations]

function onReferenceEnter() {
  if (reference.value) {
    policy.references.push(reference.value);
  }

  reference.value = null;
}

function removeReference(index: number) {
  policy.references.splice(index, 1);
}

function addRule() {
  rules.value.push(markRaw(PolicyRule));
}

function removeRule(index: number) {
  rules.value.splice(index, 1);
}
</script>

<template>
  <section class="container">
    <Steppy
      v-model:step="step"
      :tabs="tabs"
      primaryColor1="teal"
      :finalize="onDone"
    >
      <template #1>
        <p>
          <label>Type</label>
          <select v-model="policy.type">
            <option :value="ODRL('Set').value">Set</option>
            <option :value="ODRL('Offer').value">Offer</option>
            <option :value="ODRL('Agreement').value">Agreement</option>
            <option :value="ODRL('Request').value">Request</option>
            <option :value="ODRL('Privacy').value">Privacy</option>
            <option :value="ODRL('Assertion').value">Assertion</option>
            <option :value="ODRL('Ticket').value">Ticket</option>
          </select>
        </p>
        <p v-if="policy.type === ODRL('Agreement').value">
          <label>References</label>
          <input v-model="reference" @keyup.enter="onReferenceEnter" />

          <br />

          <ul>
            <li v-for="(_reference, index) in policy.references" :key="index">
              {{ _reference }} 

              <span
                  @click="removeReference(index)"
                  class="remove"
                  >X</span
                >
            </li>
          </ul>
        </p>
        <p>
          <label>Creator</label>
          <input v-model="policy.creator" type="text" />
        </p>
        <p>
          <label>Date</label>
          <input v-model="policy.issued" type="date" />
        </p>
        <p>
          <label>Description</label>
          <textarea v-model="policy.description"></textarea>
        </p>
      </template>
      <template #2>
        <h2>Rules</h2>
        <ul>
          <li v-for="(rule, index) in rules" :key="index">
            <h3>
              Rule {{ index + 1 }}
              <span
                v-if="rules.length > 1"
                @click="removeRule(index)"
                class="remove"
                >X</span
              >
            </h3>
            <keep-alive>
              <template v-if="initialArrayOfRules[index] !== undefined">
                <component
                  :is="rule"
                  :policy="policy"
                  v-model:rule="initialArrayOfRules[index]"
                  :key="index"
                ></component>
              </template>
              <template v-else>
                <component
                  :is="rule"
                  :policy="policy"
                  :key="index"
                ></component>
              </template>
            </keep-alive>
          </li>
          <br />
          <li class="no-list-style">
            <button @click="addRule">Add rule</button>
          </li>
        </ul>
      </template>
    </Steppy>

    <p v-if="done" style="white-space: pre; font-family: monospace;">
      {{ JSON.stringify(policies, null, 4) }}
    </p>
  </section>
</template>

<style>
* {
  text-align: left;
}

.no-list-style {
  list-style: none;
}

.remove {
  color: red;
  font-size: 12px;
  cursor: pointer;
}

.green {
  color: teal;
  cursor: pointer;
}
</style>
