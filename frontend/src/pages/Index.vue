<script setup lang="ts">
import { ref } from "vue";

import { Translation } from "../../../server/src/translator";
import actions from "../shared/actions";

const input = ref("");
const language = ref("english");
const results = ref<{ policies: Array<Translation> } | null>(null);
const isLoading = ref(false);

function replaceURLByLink(text: string) {
  const URLMatcher =
    /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;

  return text.replace(URLMatcher, (match) => `<a href="${match}">${match}</a>`);
}

async function onSubmit() {
  results.value = null;
  isLoading.value = true;

  try {
    const response = await fetch("http://localhost:3000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        policy: input.value,
        language: language.value
      })
    });

    isLoading.value = false;

    results.value = await response.json();
  } catch {
    isLoading.value = false;
  }
}
</script>

<template>
  <section class="container">
    <div class="input-container">
      <textarea v-model="input" rows="40" cols="100" />
      <div>
        <select v-model="language">
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="chinese">Chinese</option>
          <option value="japanese">Japanese</option>
          <option value="arabic">Arabic</option>
          <option value="italian">Italian</option>
          <option value="turkish">Turkish</option>
          <option value="romanian">Romanian</option>
          <option value="german">German</option>
          <option value="portuguese">Portuguese</option>
        </select>
        <button @click="onSubmit">Submit</button>
      </div>
    </div>
    <div class="result-container">
      <p class="loading" v-if="isLoading">Translating</p>

      <div
        class="result"
        :dir="['arabic', 'hebrew'].includes(language) ? 'rtl' : 'ltr'"
        v-for="(policy, index) of results?.policies || []"
        :key="index"
      >
        <template v-if="policy">
          <h3 class="blue">Policy description</h3>
          <p v-html="replaceURLByLink(policy.description)"></p>

          <template v-if="Object.keys(policy.permissions).length > 0">
            <h3 class="green">Permissions</h3>

            <ul>
              <li
                v-for="(permission, index) in policy.permissions"
                :key="index"
              >
                <span>
                  <strong>Term: {{ permission.cce }}</strong>
                </span>

                <br />

                <span
                  v-for="(action, _index) in permission.actions"
                  :key="_index"
                >
                  <p v-html="replaceURLByLink(action.sentence)"></p>

                  <template
                    v-if="action.refinements.filter(Boolean).length > 0"
                  >
                    <h5 class="orange">Action constraints</h5>

                    <ul>
                      <li
                        v-for="(refinement, _index) in action.refinements"
                        :key="_index"
                      >
                        <span v-html="replaceURLByLink(refinement)"></span>
                      </li>
                    </ul>
                  </template>
                </span>

                <template
                  v-if="
                    permission.constraints && permission.constraints?.length > 0
                  "
                >
                  <h5 class="orange">Permission constraints</h5>
                  <ul>
                    <li
                      v-for="(constraint, _index) in permission.constraints"
                      :key="_index"
                    >
                      <span v-html="replaceURLByLink(constraint)"></span>
                    </li>
                  </ul>
                </template>

                <template
                  v-if="
                    permission.duties &&
                    Object.keys(permission.duties).length > 0
                  "
                >
                  <h5 class="orange">Duties</h5>
                  <ul>
                    <li
                      v-for="(duty, _index) in permission.duties"
                      :key="_index"
                    >
                      <span
                        v-for="(action, _index) in duty.actions"
                        :key="_index"
                        v-html="replaceURLByLink(action.sentence)"
                      >
                      </span>

                      <template
                        v-if="duty.constraints && duty.constraints.length > 0"
                      >
                        <h5 class="yellow">Duty constraints</h5>
                        <ul>
                          <li
                            v-for="(constraint, _index) in duty.constraints"
                            :key="_index"
                          >
                            <span v-html="replaceURLByLink(constraint)"></span>
                          </li>
                        </ul>
                      </template>
                    </li>
                  </ul>
                </template>

                <hr />
              </li>
            </ul>
          </template>

          <template v-if="Object.keys(policy.prohibitions).length > 0">
            <h3 class="red">Prohibitions</h3>

            <ul>
              <li
                v-for="(prohibition, index) in policy.prohibitions"
                :key="index"
              >
                <span>
                  <strong>Term: {{ prohibition.cce }}</strong>
                </span>

                <br />

                <span
                  v-for="(action, _index) in prohibition.actions"
                  :key="_index"
                >
                  <p v-html="replaceURLByLink(action.sentence)"></p>

                  <template
                    v-if="action.refinements.filter(Boolean).length > 0"
                  >
                    <h5 class="orange">Action constraints</h5>

                    <ul>
                      <li
                        v-for="(refinement, _index) in action.refinements"
                        :key="_index"
                      >
                        <span v-html="replaceURLByLink(refinement)"></span>
                      </li>
                    </ul>
                  </template>
                </span>

                <template
                  v-if="
                    prohibition.constraints &&
                    prohibition.constraints?.length > 0
                  "
                >
                  <h5 class="orange">Prohibition constraints</h5>
                  <ul>
                    <li
                      v-for="(constraint, _index) in prohibition.constraints"
                      :key="_index"
                    >
                      <span
                        v-html="
                          replaceURLByLink(
                            `${index + 1}.1.${_index + 1}. ${constraint}`
                          )
                        "
                      ></span>
                    </li>
                  </ul>
                </template>

                <template
                  v-if="
                    prohibition.remedies &&
                    Object.keys(prohibition.remedies).length > 0
                  "
                >
                  <h5 class="orange">Remedies</h5>
                  <ul>
                    <li
                      v-for="(duty, _index) in prohibition.remedies"
                      :key="_index"
                    >
                      <span
                        v-for="(action, _index) in duty.actions"
                        :key="_index"
                        v-html="replaceURLByLink(action.sentence)"
                      >
                      </span>

                      <template
                        v-if="duty.constraints && duty.constraints.length > 0"
                      >
                        <h5 class="yellow">
                          {{ index + 1 }}.1. Duty constraints
                        </h5>
                        <ul>
                          <li
                            v-for="(constraint, _index) in duty.constraints"
                            :key="_index"
                          >
                            <span
                              v-html="
                                replaceURLByLink(
                                  `${index + 1}.1.${_index + 1}. ${constraint}`
                                )
                              "
                            ></span>
                          </li>
                        </ul>
                      </template>
                    </li>
                  </ul>
                </template>

                <hr />
              </li>
            </ul>
          </template>

          <template v-if="Object.keys(policy.obligations).length > 0">
            <h3 class="orange">Obligations</h3>

            <ul>
              <li
                v-for="(obligation, index) in policy.obligations"
                :key="index"
              >
                <span>
                  <strong>Term: {{ obligation.cce }}</strong>
                </span>

                <br />

                <span
                  v-for="(action, _index) in obligation.actions"
                  :key="_index"
                >
                  <p v-html="replaceURLByLink(action.sentence)"></p>

                  <template
                    v-if="action.refinements.filter(Boolean).length > 0"
                  >
                    <h5 class="orange">Action constraints</h5>

                    <ul>
                      <li
                        v-for="(refinement, _index) in action.refinements"
                        :key="_index"
                      >
                        <span v-html="replaceURLByLink(refinement)"></span>
                      </li>
                    </ul>
                  </template>
                </span>

                <template
                  v-if="
                    obligation.constraints && obligation.constraints?.length > 0
                  "
                >
                  <h5 class="orange">Obligation constraints</h5>
                  <ul>
                    <li
                      v-for="(constraint, _index) in obligation.constraints"
                      :key="_index"
                    >
                      <span v-html="replaceURLByLink(constraint)"></span>
                    </li>
                  </ul>
                </template>

                <template
                  v-if="
                    obligation.consequences &&
                    Object.keys(obligation.consequences).length > 0
                  "
                >
                  <h5 class="orange">Consequencecs</h5>
                  <ul>
                    <li
                      v-for="(duty, _index) in obligation.consequences"
                      :key="_index"
                    >
                      <span
                        v-for="(action, _index) in duty.actions"
                        :key="_index"
                        v-html="replaceURLByLink(action.sentence)"
                      >
                      </span>

                      <template
                        v-if="duty.constraints && duty.constraints.length > 0"
                      >
                        <h5 class="yellow">
                          {{ index + 1 }}.1. Duty constraints
                        </h5>
                        <ul>
                          <li
                            v-for="(constraint, _index) in duty.constraints"
                            :key="_index"
                          >
                            <span
                              v-html="
                                replaceURLByLink(
                                  `${index + 1}.1.${_index + 1}. ${constraint}`
                                )
                              "
                            ></span>
                          </li>
                        </ul>
                      </template>
                    </li>
                  </ul>
                </template>

                <hr />
              </li>
            </ul>
          </template>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.input-container {
  display: flex;
  flex-direction: column;
  width: 45%;
}

.input-container > * {
  margin: 5px;
}

.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 50px;
  text-align: justify;
  width: 45%;
}

.loading {
  font-family: "Menlo", monospace;
}

.loading::after {
  animation: ellipsis 2s steps(3) infinite;
  content: "...";
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
}

@keyframes ellipsis {
  0% {
    width: 0;
  }
  75% {
    width: 3ch;
  }
  100% {
    width: 3ch;
  }
}

.green {
  color: #00c400;
}

.red {
  color: #ff5050;
}

.orange {
  color: #e38334;
}

.blue {
  color: #34c0e3;
}

.yellow {
  color: #e3da34;
}
</style>
