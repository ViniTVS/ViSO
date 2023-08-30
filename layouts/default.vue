
<script setup>
import { themeChange } from 'theme-change';
import { ref, watch } from 'vue';


let isDark = ref(false);
// watch(isDark, (a, b) => {
//   console.log(a, b);
// });

onMounted(() => {
  themeChange(false);
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark';
  // document.getElementById("navbar").focus();
  // teste = document.documentElement.getAttribute('data-theme') == 'dark_theme';
})

</script>

<template>
  <div class="flex flex-col" style="height: 100vh;">
    <header>
      <div class="navbar bg-primary text-primary-content hidden sm:flex">
        <div class="flex-1">
          <NuxtLink class="btn btn-ghost normal-case text-xl" to="/">VisualSO</NuxtLink>
        </div>
        <div class="flex justify-end flex-1 px-2">
          <NuxtLink class="btn btn-primary btn-sm normal-case tm-1" to="/sobre">Sobre</NuxtLink>
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-primary btn-sm normal-case tm-1">Algoritmos</label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200  rounded-box w-52">
              <li>
                <NuxtLink :class="isDark ? 'text-primary-content' : 'text-black'" to="/algoritmos/produtor">
                  Produtor-Consumidor</NuxtLink>
              </li>
              <li>
                <NuxtLink :class="isDark ? 'text-primary-content' : 'text-black'" to="/algoritmos/slab">Slab</NuxtLink>
              </li>
            </ul>
          </div>
          <button class="btn btn-primary btn-sm" data-toggle-theme="dark,light" aria-label="Alterar tema"
            v-on:click="isDark = !isDark">
            <Icon v-if="isDark" name="ph:sun" color="white" />
            <Icon v-else name="ph:moon-fill" color="white" />
          </button>
        </div>
      </div>
    </header>
    <main class="grow">
      <slot />
    </main>
  </div>
</template>



<style>
* {
  font-family: Roboto;
}

body {
  margin: 0;
  /* padding: 0; */
}


.flex-grow {
  flex-grow: 1;
}
</style>

