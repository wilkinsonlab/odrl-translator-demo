<script setup lang="ts">
import type { Duty, Permission, Prohibition } from "../types";

import { useObligation, type Props } from "../composables/useObligation";

import GroupConstraints from "./GroupConstraints.vue";

const props = withDefaults(defineProps<Props>(), {
  allowConsequences: true
});
const initialObligation = defineModel<Duty>("obligation");
const parent = defineModel<Permission | Prohibition>("parent");

const {
  targets,
  actions,
  assignees,
  consequences,
  addTarget,
  removeTarget,
  addAction,
  removeAction,
  addAssignee,
  removeAssignee,
  addConsequence,
  removeConsequence,
  obligation
} = useObligation(props, parent, initialObligation);

const childrenParentType = parent.value
  ? props.parentType === "permission"
    ? "duty"
    : "remedy"
  : ("rule" as "duty" | "remedy" | "rule");
const childrenData = parent.value
  ? props.parentType === "permission"
    ? { duty_id: obligation.id }
    : { remedy_id: obligation.id }
  : {};
</script>

<template>
  <section>
    <ul>
      <li><h3 class="title">Targets</h3></li>
      <li class="no-list-style">
        <ul>
          <li v-for="(target, index) in targets" :key="target.name">
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
              v-model:target="obligation.targets[index]"
              v-model:parent="obligation"
              :parentType="childrenParentType"
              :data="childrenData"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addTarget">
            + Add {{ parentType === "permission" ? "duty" : "remedy" }} target
          </li>
        </ul>
      </li>
    </ul>

    <ul>
      <li><h3>Actions</h3></li>
      <li class="no-list-style">
        <ul>
          <li v-for="(action, index) in actions" :key="action.name">
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
              v-model:action="obligation.actions[index]"
              v-model:parent="obligation"
              :parentType="childrenParentType"
              :data="childrenData"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addAction">
            + Add duty action
          </li>
        </ul>
      </li>
    </ul>

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
              v-model:assignee="obligation.assignees[index]"
              v-model:parent="obligation"
              :parentType="childrenParentType"
              :data="childrenData"
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addAssignee">
            + Add duty assignee
          </li>
        </ul>
      </li>
    </ul>

    <ul v-if="allowConsequences">
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
              v-model:consequence="obligation.consequences![index]"
              v-model:parent="obligation"
              :parentType="parent ? 'duty' : 'obligation'"
              :additionalData="
                parent
                  ? {
                      rule_id: parent.id ?? obligation.id,
                      ...(parent ? { duty_id: obligation.id } : {})
                    }
                  : {}
              "
            ></component>
          </li>
          <br />
          <li class="green no-list-style" @click="addConsequence">
            + Add {{ parent ? "duty" : "obligation" }} consequence
          </li>
        </ul>
      </li>
    </ul>

    <ul>
      <li><h3>Constraints</h3></li>
      <li class="no-list-style">
        <group-constraints
          v-if="obligation.operand"
          v-model:parent="obligation"
          v-model:constraints="
            obligation.logical_constraints[obligation.operand]
          "
          :parentType="parent ? 'duty' : 'rule'"
          :additionalData="{
            rule_id: parent?.id,
            ...(parent ? { duty_id: obligation.id } : {})
          }"
        >
        </group-constraints>
        <group-constraints
          v-else
          v-model:parent="obligation"
          v-model:constraints="obligation.constraints"
          :parentType="parent ? 'duty' : 'rule'"
          :additionalData="{
            rule_id: parent?.id,
            ...(parent ? { duty_id: obligation.id } : {})
          }"
        >
        </group-constraints>
      </li>
    </ul>
  </section>
</template>

<style></style>
