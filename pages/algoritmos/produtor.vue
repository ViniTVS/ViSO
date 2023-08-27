
<template>
  <div class="flex flex-col" style="height: 100%;">
    <div class="grow" ref="d3Container" id="d3Container"></div>
    <div id="comandos" class=" m-auto" style="height: 60px;">
      <div class="join">
        <button class="btn join-item" v-on:click="addProduto">Adiciona produto</button>
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


let canvas = ref(null);
let containerW = ref(null);
let containerH = ref(null);
let tam_quadrado = 20;
let rotulos = ref({
  obj: [],
  texto: ["Produtor", "Buffer", "Consumidor"]
});
let produtos = ref([]);
let buffer = ref([]);
let consumidos = ref([]);


onMounted(() => {
  createWelcomePage();
  // criaCirculo();
  handleResize();
  window.addEventListener('resize', handleResize);
  for (let i = 0; i < rotulos.value.texto.length; i++) {
    var t = canvas.value.append("text")
      .text(rotulos.value.texto[i])
      .attr("x", containerW.value * (i + 1) / 4)
      .attr("text-anchor", "middle")
      .attr("y", containerH.value * 0.70);
    rotulos.value.obj.push(t);
  }

})

function createWelcomePage() {
  canvas.value = d3.select("#d3Container")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');
}

function handleResize() {
  containerW.value = document.getElementById("d3Container").offsetWidth;
  containerH.value = document.getElementById("d3Container").offsetHeight;
  desenhaProdutos();
}
function addProduto() {
  if (produtos.value.length >= 5)
    return;

  var produto = canvas.value.append("rect")
    .attr("width", tam_quadrado)
    .attr("height", tam_quadrado)
    .attr('x', containerW.value / 4)
    .attr('y', containerH.value * 0.60 - 30 * produtos.value.length)
    .attr('fill', 'transparent');
  // depois de usar transition ele retorna o elemento da transition, não
  // o objeto original, então é necessário separá-los
  produto.transition().duration(250).attr('fill', 'green');

  produtos.value.push(produto);

}
function removeProduto() {
  if (produtos.value.length == 0)
    return;

  produtos.value[0]
    .transition()
    .duration(250)
    .attr('fill', 'transparent')
    .remove();
  produtos.value.shift();

  for (let i in produtos.value) {
    produtos.value[i]
      .transition()
      .delay(250)
      .duration(750)
      .attr('x', containerW.value / 4)
      .attr('y', containerH.value * 0.60 - 30 * i);
  }
}
// function desenaRotulos() {

// }
function desenhaProdutos() {
  for (let i in produtos.value) {
    produtos.value[i]
      .attr('x', containerW.value / 4)
      .attr('y', containerH.value * 0.60 - 30 * i);
  }
}
function criaCirculo() {
  var circle = canvas.value.append('circle')
    .attr('cx', 250)
    .attr('cy', 250)
    .attr('r', 50)
    .attr('fill', 'red');

  circle.transition()
    .duration(1500)
    .delay(2000)
    .attr('cx', 100)
    .attr('cy', 100)
    .transition()
    .attr('fill', 'blue');

  circle.on('mouseover', function () {
    d3.select(this)
      .transition()
      .attr('r', 100)
      .attr('fill', 'green');
  });


  circle.on('mouseout', function () {
    d3.select(this)
      .transition()
      .attr('r', 50)
      .attr('fill', 'red');
  });

  circle.on('click', function () {
    d3.select(this)
      .transition()
      .attr('r', 200)
      .attr('fill', 'yellow');
  });
}

</script>
