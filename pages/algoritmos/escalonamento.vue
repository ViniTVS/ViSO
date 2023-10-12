
<template>
  <div class="flex flex-col h-full">
    <!-- <div class="grow">a</div> -->
    <div class="flex flex-row items-start">
      <div class="flex flex-col-reverse h-full justify-evenly" style="height: 274px; padding-left: 10px;">
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
  title: 'Escalonamento de tarefas - VisualSO'
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
// constantes com tamanhos dos quadrados, círculos e buffer
const TAM_QUADRADO = 25;
let gridData;
let canvas;
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


/**
 * Função chamada uma só vez quando a página é montada.
 */
onMounted(() => {
  // "cria" canvas 
  canvas = d3.select("#d3Container")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  let saida = firstComefirstServed(tarefas);
  console.log(saida);
  let colunas = saida.length;
  document.getElementById('d3Container').setAttribute("style", "width:" + (colunas * TAM_QUADRADO + 4) + "px");
  gridData = criaGrid(saida);

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
    .style("stroke", function (d) { return d.cor_borda; })
    .attr("stroke-width", 2);
})

/**
 * Cria um vetor de tarefas para ser passado à criaGrid.
 * 
 * @param {Array} tarefas Vetor de objetos com campos ingresso, duracao, prioridade e estado
 * @param {Int} indice_atual Índice da última tarefa executada. Por padrão é -1.
 * @param {Int} tempo Tempo de execução do algoritmo. Por padrão é 0.
 * 
 * @returns Vetor de tarefas com campo estado atualizado.
 */
function firstComefirstServed(tarefas, indice_atual = -1, tempo = 0) {
  var indice;
  // define indice inicial. Se a tarefa ainda não acabou, usar seu indice 
  if (indice_atual >= 0 && tarefas[indice_atual].duracao > 0) {
    indice = indice_atual;
  } else {
    indice = -1;
  }
  var tarefas_c = structuredClone(tarefas);  // copia vetor de tarefas

  // passa por todas as tarefas e "coloca para execução" a de menor tempo de ingresso
  for (let i = 0; i < tarefas_c.length; i++) {
    // tarefa está em espera ou sendo executada
    if (tarefas_c[i].ingresso <= tempo && tarefas_c[i].duracao > 0) {
      tarefas_c[i].estado = 1;
      if (indice == -1) { // indice ainda não definido
        indice = i;
      } // first come, first served
      else if (tarefas_c[i].ingresso < tarefas_c[indice].ingresso) {
        indice = i;
      }
    }
    // atualiza estado se tarefa já foi executada
    if (tarefas_c[i].duracao <= 0 || tarefas_c[i].ingresso > tempo)
      tarefas_c[i].estado = 0;
  }
  // verifica se ainda tem tarefas para serem executadas
  let resta_tarefa = false;
  for (let i = 0; i < tarefas_c.length; i++) {
    if (tarefas_c[i].ingresso > tempo) {
      resta_tarefa = true;
      break;
    }
  }
  // caso base - não tem mais tarefas a serem feitas
  if (indice == -1 && !resta_tarefa)
    return [];

  // atualiza a duracao e estado do selecionado
  if (indice >= 0) {
    tarefas_c[indice].duracao -= 1;
    tarefas_c[indice].estado = 2;
  }

  var saida = [];
  saida.push(tarefas_c);
  var ret = firstComefirstServed(tarefas_c, indice, tempo + 1);
  // cria um vetor de tarefas e o retorna
  for (let r of ret) {
    saida.push(r);
  }
  return saida;
}

function criaGrid(tarefas) {
  let linhas = tarefas[0].length;
  let colunas = tarefas.length;
  var grid = new Array();
  var click = 0;

  // iterate for rows
  for (var lin = 0; lin < linhas; lin++) {
    grid.push(new Array());
    // iterate for cells/cols inside rows
    for (var col = 0; col < colunas; col++) {
      const [cor, borda] = getColorByState(tarefas[col][linhas - lin - 1].estado, lin)
      grid[lin].push({
        x: TAM_QUADRADO * col,
        y: TAM_QUADRADO * lin,
        width: TAM_QUADRADO,
        height: TAM_QUADRADO,
        click: click,
        cor: cor,
        cor_borda: borda,
        estado: tarefas[col][linhas - lin - 1].estado
      })
    }
    // ordena vetor para o d3 poder desenhar os coloridos por último
    grid[lin] = grid[lin].sort((a, b) => a.estado > b.estado ? 1 : 0);
  }
  return grid;
}

function getColorByState(estado, lin) {
  if (estado == 0) return ["hsl(var(--b1))", "hsl(var(--b3))"];
  if (estado == 1) return ["hsl(var(--b1))", "hsl(var(--ac))"];
  if (estado == 2) return [cores[lin % cores.length], "hsl(var(--ac))"];
}

</script>
