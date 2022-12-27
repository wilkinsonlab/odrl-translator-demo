<script setup lang="ts">
import { ref } from "vue";

const input = ref("");
const language = ref("english");
const result = ref<{
  description: string;
  permissions?: Array<{
    sentence: string;
    constraints?: Array<{ sentence: string }>;
    duties?: Array<{ sentence: string; constraints: Array<string> }>;
  }>;
  prohibitions?: Array<{
    sentence: string;
    remedies?: Array<{ sentence: string }>;
  }>;
} | null>(null);
const isLoading = ref(false);

function replaceURLByLink(text: string) {
  const URLMatcher =
    /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;

  return text.replace(URLMatcher, (match) => `<a href="${match}">${match}</a>`);
}

async function onSubmit() {
  result.value = null;
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

    result.value = await response.json();
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
        </select>
        <button @click="onSubmit">Submit</button>
      </div>
    </div>
    <div class="result-container">
      <div
        class="result"
        :dir="['arabic', 'hebrew'].includes(language) ? 'rtl' : 'ltr'"
      >
        <p class="loading" v-if="isLoading">Translating</p>

        <template v-if="result">
          <h3 class="blue">Policy description</h3>
          <p v-html="replaceURLByLink(result.description)"></p>

          <template v-if="result.permissions && result.permissions.length > 0">
            <h3 class="green">Permissions</h3>

            <ul>
              <li
                v-for="(permission, index) in result.permissions"
                :key="index"
              >
                <span
                  v-html="
                    replaceURLByLink(`${index + 1}. ${permission.sentence}`)
                  "
                ></span>

                <template
                  v-if="
                    permission.constraints && permission.constraints?.length > 0
                  "
                >
                  <h5 class="orange">{{ index + 1 }}.1. Constraints</h5>
                  <ul>
                    <li
                      v-for="(constraint, _index) in permission.constraints"
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
                  v-if="permission.duties && permission.duties.length > 0"
                >
                  <h5 class="orange">{{ index + 1 }}.1. Duties</h5>
                  <ul>
                    <li
                      v-for="(duty, _index) in permission.duties"
                      :key="_index"
                    >
                      <span
                        v-html="
                          replaceURLByLink(
                            `${index + 1}.1.${_index + 1}. ${duty.sentence}`
                          )
                        "
                      ></span>

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
              </li>
            </ul>
          </template>

          <template
            v-if="result.prohibitions && result.prohibitions.length > 0"
          >
            <h3 class="red">Prohibitions</h3>
            <ul>
              <li
                v-for="(prohibition, index) in result.prohibitions"
                :key="index"
              >
                <span
                  v-html="
                    replaceURLByLink(`${index + 1}. ${prohibition.sentence}`)
                  "
                ></span>

                <template
                  v-if="prohibition.remedies && prohibition.remedies.length > 0"
                >
                  <h5 class="orange">{{ index + 1 }}.1. Remedies</h5>
                  <ul>
                    <li
                      v-for="(remedy, _index) in prohibition.remedies"
                      :key="_index"
                    >
                      <span
                        v-html="
                          replaceURLByLink(
                            `${index + 1}.1.${_index + 1}. ${remedy.sentence}`
                          )
                        "
                      ></span>
                    </li>
                  </ul>
                </template>
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
