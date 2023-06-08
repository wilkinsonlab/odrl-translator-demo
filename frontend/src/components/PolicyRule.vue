<script setup lang="ts">
import { Permission, Prohibition, Rule } from "../types";

import { ref, markRaw, watch, reactive } from "vue";
import { ODRL } from "../../../server/src/namespaces";

import usePolicy from "../composables/usePolicy";
import { useRule, rulesMapping } from "../composables/useRule";

import GroupConstraints from "./GroupConstraints.vue";

const initialRule = defineModel<Rule>("rule");

const { policy } = usePolicy();
const {
  cces,
  cce,
  ruleType,
  targets,
  actions,
  assigner,
  assignees,
  duties,
  remedies,
  consequences,
  addTarget,
  removeTarget,
  addAction,
  removeAction,
  addAssignee,
  removeAssignee,
  addDuty,
  removeDuty,
  addRemedy,
  removeRemedy,
  addConsequence,
  removeConsequence,
  rule
} = useRule(initialRule);

watch(ruleType, (newRuleType, previousRuleType) => {
  if (previousRuleType) {
    const previousRuleTypeIndex = policy.rules[
      rulesMapping[previousRuleType]
    ].findIndex((_rule: any) => _rule.id === rule.id);

    if (previousRuleTypeIndex > -1) {
      policy.rules[rulesMapping[previousRuleType]].splice(
        previousRuleTypeIndex,
        1
      );
    }
  }

  if (ruleType.value === ODRL("permission").value) {
    for (const key of ["remedies", "consequences"] as const) {
      if (rule[key]) {
        delete rule[key];
      }
    }

    rule.duties = [];
  } else if (ruleType.value === ODRL("prohibition").value) {
    for (const key of ["duties", "consequences"] as const) {
      if (rule[key]) {
        delete rule[key];
      }
    }

    rule.remedies = [];
  } else if (ruleType.value === ODRL("obligation").value) {
    for (const key of ["duties", "remedies"] as const) {
      if (rule[key]) {
        delete rule[key];
      }
    }

    rule.consequences = [];
  }

  policy.rules[rulesMapping[newRuleType!]].push(rule as any);
});
</script>

<template>
  <section>
    <p>
      <label>Common Condition of Use Element</label>
      <select v-model="cce">
        <option v-for="(_cce, key) of cces" :key="key" :value="key">
          {{ _cce }}
        </option>
      </select>
    </p>

    <p>
      <label>Rule type</label>
      <select v-model="ruleType">
        <option :value="ODRL('permission').value">Permission</option>
        <option :value="ODRL('prohibition').value">Prohibition</option>
        <option :value="ODRL('obligation').value">Obligation</option>
      </select>
    </p>

    <template v-if="ruleType">
      <ul>
        <li><h3 class="title">Targets</h3></li>
        <li class="no-list-style">
          <ul>
            <li v-for="(target, index) in targets" :key="index">
              <h4>
                Target {{ index + 1 }}
                <span
                  v-if="targets.length > 1"
                  @click="removeTarget(index)"
                  class="remove"
                  >X</span
                >
              </h4>
              <component
                :is="target"
                v-model:parent="rule"
                v-model:target="rule.targets[index]"
                parentType="rule"
                :key="index"
              ></component>
            </li>
            <br />
            <li class="green no-list-style" @click="addTarget">+ Add target</li>
          </ul>
        </li>
      </ul>

      <ul>
        <li><h3>Actions</h3></li>
        <li class="no-list-style">
          <ul>
            <li v-for="(action, index) in actions" :key="index">
              <h4>
                Action {{ index + 1 }}
                <span
                  v-if="actions.length > 1"
                  @click="removeAction(index)"
                  class="remove"
                  >X</span
                >
              </h4>
              <component
                :is="action"
                v-model:action="rule.actions[index]"
                v-model:parent="rule"
                parentType="rule"
              ></component>
            </li>
            <br />
            <li class="green no-list-style" @click="addAction">+ Add action</li>
          </ul>
        </li>
      </ul>

      <p>
        <label>Assigner</label>
        <input type="text" v-model="assigner" />
      </p>

      <ul>
        <li><h3>Assignees</h3></li>
        <li class="no-list-style">
          <ul>
            <li v-for="(assignee, index) in assignees" :key="assignee.name">
              <h4>
                Assignee {{ index + 1 }}
                <span @click="removeAssignee(index)" class="remove">X</span>
              </h4>
              <component
                :is="assignee"
                v-model:parent="rule"
                v-model:assignee="rule.assignees[index]"
                parentType="rule"
              ></component>
            </li>
            <br />
            <li class="green no-list-style" @click="addAssignee">
              + Add assignee
            </li>
          </ul>
        </li>
      </ul>

      <ul>
        <li><h3>Constraints</h3></li>
        <group-constraints
          v-if="rule.operand"
          v-model:parent="rule"
          v-model:constraints="rule.logical_constraints[rule.operand]"
          parentType="rule"
        >
        </group-constraints>
        <group-constraints
          v-else
          v-model:parent="rule"
          v-model:constraints="rule.constraints"
          parentType="rule"
        >
        </group-constraints>
      </ul>

      <ul v-if="ruleType === ODRL('permission').value">
        <li><h3>Duties</h3></li>
        <li class="no-list-style">
          <ul>
            <li v-for="(duty, index) in duties" :key="index">
              <h4>
                Duty {{ index + 1 }}
                <span @click="removeDuty(index)" class="remove">X</span>
              </h4>
              <component
                :is="duty"
                v-model:parent="rule"
                v-model:obligation="rule.duties![index]"
                parentType="permission"
                :data="{ rule_id: rule.id }"
              ></component>
            </li>
            <br />
            <li class="green no-list-style" @click="addDuty">+ Add duty</li>
          </ul>
        </li>
      </ul>

      <ul v-if="ruleType === ODRL('prohibition').value">
        <li><h3>Remedies</h3></li>
        <li class="no-list-style">
          <ul>
            <li v-for="(remedy, index) in remedies" :key="remedy.name">
              <h4>
                Remedy {{ index + 1 }}
                <span @click="removeRemedy(index)" class="remove">X</span>
              </h4>
              <component
                :is="remedy"
                v-model:parent="rule"
                v-model:obligation="rule.remedies![index]"
                parentType="prohibition"
                :data="{ rule_id: rule.id }"
                :allowConsequences="false"
              ></component>
            </li>
            <br />
            <li class="green no-list-style" @click="addRemedy">+ Add remedy</li>
          </ul>
        </li>
      </ul>

      <ul v-if="ruleType === ODRL('obligation').value">
        <li><h3>Consequences</h3></li>
        <li class="no-list-style">
          <ul>
            <li
              v-for="(consequence, index) in consequences"
              :key="consequence.name"
            >
              <h4>
                Consequence {{ index + 1 }}
                <span @click="removeConsequence(index)" class="remove">X</span>
              </h4>
              <component
                :is="consequence"
                :parent="(rule as any)"
                parentType="obligation"
                :additionalData="{
                  rule_id: rule.id
                }"
              ></component>
            </li>
            <br />
            <li class="green no-list-style" @click="addConsequence">
              + Add rule consequence
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </section>
</template>

<style></style>
