
<script lang="ts" setup>

const route = useRoute();
let activeIndex = route.path;

</script>

<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">
      <el-header>
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :router=true>
          <el-menu-item index="/">Início</el-menu-item>
          <el-menu-item index="/sobre">Sobre</el-menu-item>
          <el-sub-menu index="/algoritmos">
            <template #title>Algoritmos</template>
            <el-menu-item index="/algoritmos/produtor">Produtor-consumidor</el-menu-item>
            <el-menu-item index="/algoritmos/slab">Slab</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-header>
      <el-main>
        <slot />
      </el-main>
      <el-footer style="height: 50px; background-color: aqua;" v-if="route.path.includes('/algoritmos')">
        Footer
      </el-footer>
    </el-container>
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

