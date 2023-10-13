
<template>
  <div class="flex flex-col h-full">
    <!-- <div class="grow">a</div> -->
    <div>
      <table>
        <thead>
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="row.id">
            <td v-for="(cell, index) in row.cells" :key="index">
              <span v-if="cell.id === 1" style="padding: 8px">{{ cell.value }}</span>
              <span v-else-if="cell.id === 7" style="padding: 8px">{{ cell.value }}</span>
              <span v-else-if="cell.id === 13" style="padding: 8px">{{ cell.value }}</span>
              <input v-else type="number" v-model="cell.value" @change="updateTarefas(row.id, cell.value)" min="0"
                max="5">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class=" flex flex-row items-start">
      <div class="flex flex-col h-full justify-evenly" style="height: 274px; padding-left: 10px;">
        <p>t1</p>
        <p>t2</p>
        <p>t3</p>
        <p>t4</p>
        <p>t5</p>
      </div>
      <div style="overflow: scroll;">
        <div ref="d3Container" id="d3Container"></div>
      </div>

    </div>
  </div>
</template>


<style scoped>
#d3Container {
  height: 274px;
  margin: 20px;
  display: block;
  font-size: 24px;
  overflow: scroll;
}
</style>

<script setup>


import * as d3 from "d3";


import { ref, computed, onMounted, } from 'vue';

useHead({
  title: 'Produtor-consumidor - VisualSO'
});
const headers = ["Tarefa", "t1", "t2", "t3", "t4", "t5"];
const data = [
  {
    id: 1, cells: [
      { id: 1, value: "ingresso" },
      { id: 2, value: "0" },
      { id: 3, value: "1" },
      { id: 4, value: "2" },
      { id: 5, value: "2" },
      { id: 6, value: "3" }]
  },
  {
    id: 2, cells: [
      { id: 7, value: "duração" },
      { id: 8, value: "5" },
      { id: 9, value: "2" },
      { id: 10, value: "4" },
      { id: 11, value: "1" },
      { id: 12, value: "2" }
    ]
  },
  {
    id: 3, cells: [
      { id: 13, value: "prioridade" },
      { id: 14, value: "2" },
      { id: 15, value: "3" },
      { id: 16, value: "1" },
      { id: 17, value: "4" },
      { id: 18, value: "5" }

    ]
  }
];
// cores para usar ao criar prdutores. Também limita o num. de produtores (1 pra cada cor)
const cores = [
  // "hsl(var(--p))",
  "hsl(var(--s))",
  "hsl(var(--su))",
  "hsl(var(--in))",
  "hsl(var(--wa))",
  "hsl(var(--er))",
];
const cores_estado = [
  "hsl(var(--b1))",
  "hsl(var(--b3))",
]
// constantes com tamanhos dos quadrados, círculos e buffer
const TAM_QUADRADO = 25;
const MARGEM_DESENHO = 100;
let buffer = {
  indice_c: 0,
  indice_p: 0,
  usado: 0,
  objeto: null,
  conteudo: null,
};
let containerW = ref(null);
let containerH = ref(null);
let gridData;
let canvas;
let grid;

let row;

let col;

let tarefas = [
  {
    ingresso: 0,
    duracao: 5,
    prioridade: 2,
    estado: 1
  },
  {
    ingresso: 0,
    duracao: 2,
    prioridade: 3,
    estado: 2
  },
  {
    ingresso: 1,
    duracao: 4,
    prioridade: 1,
    estado: 1
  },
  {
    ingresso: 3,
    duracao: 1,
    prioridade: 4,
    estado: 0
  },
  {
    ingresso: 5,
    duracao: 2,
    prioridade: 5,
    estado: 0
  },
];



function updateTarefas(id, value) {

  if (id >= 2 && id <= 6) {
    tarefas[id - 2].ingresso = value;
  } if (id >= 8 && id <= 12) {
    tarefas[id - 8].duracao = value;
  } if (id >= 14 && id <= 18) {
    tarefas[id - 14].prioridade = value;
  }

}

watch(containerW, () => {
});

watch(containerH, () => {
});

/**
 * Função chamada uma só vez quando a página é montada.
 */
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  // "cria" canvas
  canvas = d3.select("#d3Container")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  var elementos = 40;
  let saida = firstComefirstServed(tarefas);
  document.getElementById('d3Container').setAttribute("style", "width:" + (elementos * TAM_QUADRADO + 4) + "px");
  gridData = criaGrid(5, elementos, tarefas);

  row = canvas.selectAll(".row")
    .data(gridData)
    .enter().append("g");

  col = row.selectAll(".square")
    .data(function (d) { return d; })
    .enter().append("rect")
    .attr("class", "square")
    .attr("x", function (d) { return d.x + 2; })
    .attr("y", function (d) { return d.y * 2 + 2; })
    .attr("width", function (d) { return d.width; })
    .attr("height", function (d) { return d.height; })
    .style("fill", function (d) { return d.cor; })
    .style("stroke", "#000")
    .attr("stroke-width", 2);
})

/**
 *
 * @param {*} tarefas vetor de objetos com campos ingresso, duracao e prioridade
 * @param {*} t
 */
function firstComefirstServed(tarefas, indice_atual = -1, tempo = 0) {
  var novo_indice = indice_atual;
  dd(tarefas[novo_indice]);
  for (let i = 0; i < tarefas.length; i++) {
    if (tarefas[i].ingresso <= tempo) {
      if (novo_indice == -1) {
        novo_indice = i;
      }
    }
  }
}

function criaGrid(linhas, colunas, tarefas) {
  var grid = new Array();
  var click = 0;

  // iterate for rows
  for (var lin = 0; lin < linhas; lin++) {
    grid.push(new Array());

    // iterate for cells/cols inside rows
    for (var col = 0; col < colunas; col++) {
      grid[lin].push({
        x: TAM_QUADRADO * col,
        y: TAM_QUADRADO * lin,
        width: TAM_QUADRADO,
        height: TAM_QUADRADO,
        click: click,
        cor: getColorByState(tarefas[lin].estado, lin)
        // click: click
      })
    }
  }
  return grid;
}

function dd() {
  for (var i = 0; i < arguments.length; ++i)
    console.log(arguments[i]);
}



function getColorByState(estado, lin) {
  if (estado == 0) return cores_estado[0];
  if (estado == 1) return cores_estado[1];
  if (estado == 2) return cores[lin % cores.length];

}
function handleResize() {
  containerW.value = document.getElementById("d3Container").offsetWidth;
  containerH.value = document.getElementById("d3Container").offsetHeight;
}

</script>
