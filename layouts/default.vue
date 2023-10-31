
<script setup>
import { themeChange } from 'theme-change';
import { ref } from 'vue';


let isDark = ref(false);
let isDropDown = ref(false);


let opcoes_dropdown = [
  { titulo: "Produtor-Consumidor", link: "/algoritmos/produtor" },
  { titulo: "Escalonamento de tarefas", link: "/algoritmos/escalonamento" },
];

onMounted(() => {
  themeChange(false);
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark';
})

// fecha menu de dropdown ao perder foco ou escolher uma opção
// pego em: https://github.com/saadeghi/daisyui/discussions/2092
function handleDropdown(event) {
  const relatedTarget = event.relatedTarget;
  const currentTarget = event.currentTarget;

  if (relatedTarget instanceof HTMLElement && currentTarget.contains(relatedTarget)) {
    return;
  }
  isDropDown.value = false;
}

function clickDropDown() {
  isDropDown.value = !isDropDown.value
}

</script>

<template>
  <div class="flex flex-col" style="height: 100vh;">
    <nav class="navbar bg-primary text-primary-content flex" id="navbar">
      <div class="flex-1">
        <NuxtLink class="btn btn-ghost normal-case text-xl" to="/">VisualSO</NuxtLink>
      </div>
      <div class="flex justify-end flex-1 px-2">
        <NuxtLink class="btn btn-primary btn-sm normal-case tm-1" to="/sobre">Sobre</NuxtLink>
        <div class="dropdown dropdown-end" @focusout="handleDropdown">
          <label tabindex="0" class="btn btn-primary btn-sm normal-case tm-1" @click="clickDropDown">Algoritmos</label>
          <!-- menu dropdown -->
          <ul :style="{ visibility: isDropDown ? 'visible' : 'hidden' }" tabindex="0"
            class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
            <!-- cria opcoes do dropdown dinamicamente -->
            <li v-for="item in opcoes_dropdown" @click="handleDropdown">
              <NuxtLink :class="isDark ? 'text-primary-content' : 'text-black'" :to="item.link">
                {{ item.titulo }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <button class="btn btn-primary btn-sm" data-toggle-theme="dark,light" aria-label="Alterar tema"
          v-on:click="isDark = !isDark">
          <Icon v-if="isDark" name="ph:sun" color="white" />
          <Icon v-else name="ph:moon-fill" color="white" />
        </button>
      </div>
    </nav>
    <div class="grow">
      <slot />
    </div>
  </div>
</template>



<style>
* {
  font-family: Roboto;
}

body {
  margin: 0;
}

[data-theme="dark"] {
  --bc: 220 100% 100% !important;
}


.flex-grow {
  flex-grow: 1;
}
</style>

