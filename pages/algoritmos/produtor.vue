
<template>
  <div class="flex flex-col" style="height: 100%;">
    <div class="grow" ref="d3Container" id="d3Container"></div>
    <div id="comandos" class=" m-auto" style="height: 60px;">
      <div class="join">
        <button class="btn btn-primary join-item" @click="criaProdutor">Adiciona produtor</button>
        <button class="btn btn-primary join-item" @click="remove()">Remove produtor</button>
        <button class="btn btn-primary join-item" @click="criaConsumidor">Adiciona Consumidor</button>
        <button class="btn btn-primary join-item" @click="remove(false)">Remove Consumidor</button>
      </div>
    </div>
  </div>
</template>
  

<style scoped>
#d3Container {
  height: 100%;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 24px;
  /* overflow: hidden; */
}

.el-col {
  text-align: center;
}
</style>

<script setup>

import * as d3 from "d3";
import * as d3a from "d3-arrow";
import { ref, computed, onMounted } from 'vue';

useHead({
  title: 'Produtor-consumidor - VisualSO'
});

const cores = [
  // "hsl(var(--p))",
  "hsl(var(--s))",
  "hsl(var(--su))",
  "hsl(var(--in))",
  "hsl(var(--wa))",
  "hsl(var(--er))",
];
const TAM_QUADRADO = 20;
const TAM_CIRCULO = 35;
const ALT_BUFFER = computed(() =>
  // 200 <= ALT_BUFFER = containerH * 0.8 <= 350 
  Math.max(
    Math.min(containerH.value * 0.8, 350),
    200
  )
);
const LARG_BUFFER = 300;
const TAM_BUFFER = 3;

let canvas = ref(null);
let containerW = ref(null);
let containerH = ref(null);
let rotulos = ref({
  obj: [],
  texto: ["Produtor", "Buffer", "Consumidor"]
});
// cada produtor é objeto, de campos: 
// objeto: o objeto/elemento do canvas pra controle, 
// texto: o objeto/elemento do texto do produtor (p + num. produtor),
//  seta: o objeto/elemento da setinha que sai de cada produtor pro buffer 
let produtores = ref([]);
let buffer = ref({
  objeto: null,
  conteudo: [],
});
let consumidores = ref([]);


watch(containerW, () => {
  desenhaProdutores();
  desenhaBuffer();
  desenhaConsumidores();
});

watch(containerH, () => {
  desenhaProdutores();
  desenhaBuffer();
  desenhaConsumidores();
});

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  // "cria" canvas 
  canvas.value = d3.select("#d3Container")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');
  // e adiciona a possibilidade de setas
  const arrow = d3a.arrow1()
    .id("my-arrow")
    .attr("fill", "hsl(var(--ac))")
    .attr("stroke", "hsl(var(--ac))");
  canvas.value.call(arrow);

  criaProdutor();
  criaProdutor();
  desenhaBuffer();
  criaConsumidor();
  criaConsumidor();
  criaConsumidor();
})

// corrige a posição do círculo, texto e seta de cada produtor
function desenhaProdutores() {
  let num_prod = produtores.value.length;
  for (let i = 0; i < num_prod; i++) {
    // queremos que cada item tenha um espaço proporcional entre si e ao mesmo tempo 
    // centralizado, então para que não fique nos extremos dividimos por num. total + 1
    let proporcao = (i + 1) / (num_prod + 1)
    let pos_x = containerW.value / 8; // fica em 1/8 da tela 
    let pos_y = containerH.value * proporcao;
    let pos_buff_x = containerW.value / 2 - LARG_BUFFER / 2;
    let ini_seta = [pos_x + TAM_CIRCULO + 10, pos_y];
    let fim_seta = [pos_buff_x - 10, (containerH.value - ALT_BUFFER.value) / 2 + proporcao * ALT_BUFFER.value];
    // (containerH.value - ALT_BUFFER.value) / 2 é o canto superior do buffer
    // depois queremos percorrer uma distância "porporcional" para "distribuir" as setas
    animaObjetoSeta(produtores.value[i], "p" + (i + 1), pos_x, pos_y, ini_seta, fim_seta);
  }
}

// corrige a posição do círculo, texto e seta de cada produtor
function desenhaConsumidores() {
  let num_con = consumidores.value.length;
  for (let i = 0; i < num_con; i++) {
    // queremos que cada item tenha um espaço proporcional entre si e ao mesmo tempo 
    // centralizado, então para que não fique nos extremos dividimos por num. total + 1
    let proporcao = (i + 1) / (num_con + 1)
    let pos_x = containerW.value * 7 / 8; // fica em 7/8 da tela 
    let pos_y = containerH.value * proporcao;
    let pos_buff_x = containerW.value / 2 + LARG_BUFFER / 2;
    let fim_seta = [pos_x - (TAM_CIRCULO + 10), pos_y];
    let ini_seta = [pos_buff_x + 10, (containerH.value - ALT_BUFFER.value) / 2 + proporcao * ALT_BUFFER.value];
    animaObjetoSeta(consumidores.value[i], "c" + (i + 1), pos_x, pos_y, ini_seta, fim_seta);
  }
}


function animaObjetoSeta(item, nome, pos_x, pos_y, seta_ini, seta_fim) {
  item.objeto
    .transition().duration(250).attr("cx", pos_x).attr("cy", pos_y);

  item.texto
    .transition().duration(250).text(nome)
    .attr("dx", pos_x)
    .attr("dy", pos_y + 8);

  if (item.seta == null) {
    item.seta = canvas.value.append("polyline")
      .attr("marker-end", "url(#my-arrow)")
      .attr("stroke", "hsl(var(--ac))")
      .attr("stroke-width", 2);
  }
  item.seta
    // .attr("stroke", "transparent")
    .transition()
    // .delay(250)
    .duration(250)
    .attr("stroke", "hsl(var(--ac))")
    .attr("points", [seta_ini, seta_fim]);
}

function clickProdutor(event) {
  let bufferCheio = false;
// buffer.value.conteudo.push();
if(bufferCheio){
  // trata quando o buffer estiver cheio
  return;
}
let id = parseInt(event.srcElement.id); 




  console.log("clickProdutor", id);





}


function desenhaBuffer() {
  if (buffer.value.objeto == null) {
    buffer.value.objeto = canvas.value.append("rect")
      .attr("width", LARG_BUFFER)
      .attr("height", ALT_BUFFER.value)
      .attr("stroke-width", 5)
      .attr("stroke", "hsl(var(--ac))")
      .attr("fill", "hsl(var(--nc))")
  }
  buffer.value.objeto
    .attr("width", LARG_BUFFER)
    .attr("height", ALT_BUFFER.value)
    .attr("x", containerW.value / 2 - LARG_BUFFER / 2)
    .attr("y", containerH.value / 2 - ALT_BUFFER.value / 2);
}

function criaProdutor() {
  if (produtores.value.length >= cores.length)
    return;

  // coloca a pos inicial dos desenhos pra fora da area pra fazer uma animação legal
  let pos_x = containerW.value / 8;
  let pos_y = containerH.value + 100;
  var objeto = canvas.value.append("circle")
    .attr("r", TAM_CIRCULO)
    .style("stroke-width", 5)
    .attr("cx", pos_x)
    .attr("cy", pos_y)
    .attr("id", produtores.value.length + 1) 
    .style("stroke", "hsl(var(--ac))")
    .style("fill", cores[produtores.value.length])
    .style("cursor", "pointer");
  objeto.on("click", clickProdutor);

  var texto = canvas.value.append("text")
    .attr("text-anchor", "middle")
    .attr("dx", pos_x)
    .attr("dy", pos_y)
    .attr("id", produtores.value.length + 1) 
    .text("")
    .style("cursor", "pointer")
    .style('fill', 'hsl(var(--ac))');
  texto.on("click", clickProdutor);

  produtores.value.push({
    objeto: objeto,
    texto: texto,
    seta: null
  });
  desenhaProdutores();
}

function criaConsumidor() {
  // coloca a pos inicial dos desenhos pra fora da area pra fazer uma animação legal
  let pos_x = containerW.value * 7 / 8;
  let pos_y = containerH.value + 100;
  var objeto = canvas.value.append("circle")
    .attr("r", TAM_CIRCULO)
    .style("stroke-width", 5)
    .attr("cx", pos_x)
    .attr("cy", pos_y)
    .style("stroke", "hsl(var(--ac))")
    .style("fill", "hsl(var(--a))")
    .style("cursor", "pointer");

  var texto = canvas.value.append("text")
    .attr("text-anchor", "middle")
    .attr("dx", pos_x)
    .attr("dy", pos_y)
    .text("")
    .style("cursor", "pointer");
  texto.style('fill', 'hsl(var(--ac))');
  consumidores.value.push({
    objeto: objeto,
    texto: texto,
    seta: null
  });
  desenhaConsumidores();
}

// remove um produtor (no caso de produtor ser true) ou consumidor (caso contrário)
function remove(produtor = true) {
  let vetor = produtor === true
    ? produtores.value
    : consumidores.value;

  if (vetor.length <= 1)
    return;

  var p = vetor.pop();
  p.objeto.remove();
  p.texto.remove();
  if (p.seta != null)
    p.seta.remove();

  if (produtor === true) {
    desenhaProdutores();
  } else {
    desenhaConsumidores();
  }
}

function handleResize() {
  containerW.value = document.getElementById("d3Container").offsetWidth;
  containerH.value = document.getElementById("d3Container").offsetHeight;
}

</script>
