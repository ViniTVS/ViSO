
<template>
  <div class="flex flex-col" style="height: 100%;">
    <div class="grow" ref="d3Container" id="d3Container"></div>
    <div id="comandos" class=" m-auto" style="height: 60px;">
      <div class="join">
        <button class="btn join-item" v-on:click="criaProdutor">Adiciona produto</button>
        <button class="btn join-item" v-on:click="removeProduto">Remove produto</button>
        <button class="btn join-item">Button</button>
      </div>
    </div>
  </div>
</template>
  

<style scoped>
#d3Container {
  height: 100%;
  padding: 0 !important;
  margin: 0 !important;
  /* overflow: hidden; */
}

.el-col {
  text-align: center;
}
</style>

<script setup>

import * as d3 from "d3";
import { ref, onMounted } from 'vue';

useHead({
  title: 'Produtor-consumidor - VisualSO'
});


const TAM_QUADRADO = 20;
const TAM_CIRCULO = 30;

let canvas = ref(null);
let containerW = ref(null);
let containerH = ref(null);
let rotulos = ref({
  obj: [],
  texto: ["Produtor", "Buffer", "Consumidor"]
});
let produtores = ref([]);
let buffer = ref([]);
let consumidos = ref([]);


watch(containerW, () => {
  // desenhaProdutores();
  desenhaProdutores();
});

onMounted(() => {
  console.log(produtores.value);
  // createWelcomePage();
  // criaCirculo();
  handleResize();
  window.addEventListener('resize', handleResize);

  canvas.value = d3.select("#d3Container")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');
    
  criaProdutor();
  criaProdutor();

})

function desenhaProdutores() {
  let num_prod = produtores.value.length;

  for (let i = 0; i < num_prod; i++) {
    produtores.value[i].objeto
      .attr("cx", containerW.value / 4)
      .attr("cy", containerH.value * (i + 1) / (num_prod + 1));
    produtores.value[i].texto
    .text("p" + (i + 1))
    .attr("dx", containerW.value / 4)
    .attr("dy", containerH.value * (i + 1) / (num_prod + 1) + 4);
  }
}

function criaProdutor() {

  var objeto = canvas.value.append("circle")
    .attr("r", TAM_CIRCULO)
    .style("stroke-width", 5)
    .style("stroke", "black")
    .style("fill", "cyan");
  
  var texto = canvas.value.append("text")
    .attr("text-anchor", "middle")
    .attr("dx", 100)
    .attr("dy", 100)
    .text("teste");


  produtores.value.push({
    objeto: objeto,
    texto: texto
  });
  desenhaProdutores();
}

function removeProdutor() {

  var t = canvas.value.append("text")
    .text(rotulos.value.texto[i])
    .attr("x", containerW.value * (i + 1) / 4)
    .attr("text-anchor", "middle")
    .attr("y", containerH.value * 0.70);
  rotulos.value.obj.push(t);
}


function handleResize() {
  containerW.value = document.getElementById("d3Container").offsetWidth;
  containerH.value = document.getElementById("d3Container").offsetHeight;
  // desenhaProdutos();
}



</script>
