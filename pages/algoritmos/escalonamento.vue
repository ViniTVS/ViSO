
<template>
  <div class="grid grid-cols-3 gap-4">
    <div class="col-span-3 md:col-span-2">
      <table class="table">
        <thead class="bg-base-200">
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="bg-base-200">Ingresso</td>
            <td v-for="tarefa in tarefas">
              <input class="w-10" type="number" min="0" v-model="tarefa.ingresso">
            </td>
          </tr>
          <tr>
            <td class="bg-base-200">Duração</td>
            <td v-for="tarefa in tarefas">
              <input class="w-10" type="number" min="0" v-model="tarefa.duracao">
            </td>
          </tr>
          <tr>
            <td class="bg-base-200">Prioridade</td>
            <td v-for="tarefa in tarefas">
              <input class="w-10" type="number" min="0" v-model="tarefa.prioridade">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-span-3 md:col-span-1 form-control m-auto p-2">
      <label class="label">
        <span class="label-text">Selecione o algoritmo de escalonamento a ser sexecutado</span>
      </label>
      <select class="select select-bordered" name="algoritmo" id="algoritmo" v-model="algoritmo">
        <option v-for="(opcao, i) in opcoes" :value="opcao.alg" :selected="i == 0"> {{ opcao.nome }}</option>
      </select>
    </div>
    <div class="col-span-full flex flex-row conteudo">
      <div class="flex flex-col-reverse h-full justify-between mt-2 p-4 pr-0">
        <p>t1</p>
        <p>t2</p>
        <p>t3</p>
        <p>t4</p>
        <p>t5</p>
      </div>
      <div style="overflow-y: hidden; overflow-x: scroll;" class="mr-4">
        <div ref="d3Container" class="m-4" id="d3Container" />
      </div>
    </div>
  </div>
</template>


<style scoped>
thead {
  font-weight: bold;
  font-size: 1rem;
  color: inherit;
  text-align: center;
}

td {
  text-align: center;
  max-width: 15vw !important;
  padding: 0.5rem !important;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.conteudo {
  max-width: 100vw;
  height: 250px !important;
  overflow-x: scroll !important;
  overflow-y: hidden;
}

#d3Container {
  height: 100%;
  overflow-x: scroll;
}
</style>

<script setup>


import * as d3 from "d3";


import { ref, onMounted, watch } from 'vue';

useHead({
  title: 'Escalonamento de tarefas - VisualSO'
});
const headers = ["Tarefa", "t1", "t2", "t3", "t4", "t5"];

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
let row = null;
let col = null;
let tarefas = ref([
  {
    ingresso: 0,
    duracao: 5,
    prioridade: 2,
    prio_dinamica: 0,
    processado: 0,
    estado: 1
  },
  {
    ingresso: 0,
    duracao: 2,
    prioridade: 3,
    prio_dinamica: 0,
    processado: 0,
    estado: 2
  },
  {
    ingresso: 1,
    duracao: 4,
    prioridade: 1,
    prio_dinamica: 0,
    processado: 0,
    estado: 1
  },
  {
    ingresso: 3,
    duracao: 1,
    prioridade: 4,
    prio_dinamica: 0,
    processado: 0,
    estado: 0
  },
  {
    ingresso: 5,
    duracao: 2,
    prioridade: 5,
    prio_dinamica: 0,
    processado: 0,
    estado: 0
  },
]);

let opcoes = [
  {
    nome: "First-Come, First Served",
    alg: firstComeFirstServed
  },
  {
    nome: "Prioridade cooperativo",
    alg: PRIOc
  },
  {
    nome: "Prioridade preemptivo",
    alg: PRIOp
  },
  {
    nome: "Prioridades dinâmicas",
    alg: PRIOd
  },
];

let algoritmo = ref(null);


watch(algoritmo, () => {
  executaAlgoritmo();
});

watch(tarefas, () => {
  executaAlgoritmo();
}, { deep: true });


/**
 * Função chamada uma só vez quando a página é montada.
 */
onMounted(() => {
  // "cria" canvas 
  canvas = d3.select("#d3Container")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');
})

function executaAlgoritmo() {
  let algoritmo_raw = algoritmo.value;
  let tarefas_raw = tarefas.value.map((t) => toRaw(t));

  if (algoritmo_raw == null || tarefas_raw == null)
    return;

  for (let i = 0; i < tarefas_raw.length; i++) {
    tarefas_raw[i].prio_dinamica = tarefas_raw[i].prioridade;
    tarefas_raw[i].processado = 0;
    tarefas_raw[i].estado = 0;
  }

  let saida = algoritmo_raw(tarefas_raw);
  let conteudo_width = saida.length * TAM_QUADRADO + 4;
  document.getElementById('d3Container').setAttribute("style", "width:" + conteudo_width + "px");
  gridData = criaGrid(saida);
  desenhaGrid(gridData);
}


/**
 * Cria um vetor de tarefas para ser passado à criaGrid.
 * 
 * @param {Array} tarefas Vetor de objetos com campos ingresso, duracao, prioridade e estado
 * @param {Int} indice_atual Índice da última tarefa executada. Por padrão é -1.
 * @param {Int} tempo Tempo de execução do algoritmo. Por padrão é 0.
 * 
 * @returns Vetor de tarefas com campo estado atualizado.
 */
function firstComeFirstServed(tarefas, indice_atual = -1, tempo = 0) {
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
  var ret = firstComeFirstServed(tarefas_c, indice, tempo + 1);
  // cria um vetor de tarefas e o retorna
  for (let r of ret) {
    saida.push(r);
  }
  return saida;
}

function PRIOc(tarefas, indice_atual = -1, tempo = 0) {
  var tarefas_c = structuredClone(tarefas);  // copia vetor de tarefas
  var indice;
  // define indice inicial. Se a tarefa ainda não acabou, usar seu indice 
  if (indice_atual >= 0 && precisaProcessar(tarefas_c[indice_atual], tempo)) {
    indice = indice_atual;
    for (let i = 0; i < tarefas_c.length; i++) {
      if (indice != i && precisaProcessar(tarefas_c[i], tempo)) {
        tarefas_c[i].estado = 1;
      }
    }
  } else {
    indice = -1;
    // define um indice
    for (let i = 0; i < tarefas_c.length; i++) {
      // se a tarefa não precisa ser processada, deixa em 0
      if (!precisaProcessar(tarefas_c[i], tempo)) {
        tarefas_c[i].estado = 0;
      } else {
        tarefas_c[i].estado = 1;
        if (indice < 0) { // seleciona uma tarefa qualquer
          indice = i;
          tarefas_c[indice].estado = 2;
        } else if (tarefas_c[i].prioridade > tarefas_c[indice].prioridade) {
          // atualizo a seleção para a tarefa de maior prioridade
          tarefas_c[indice].estado = 1;
          indice = i;
          tarefas_c[indice].estado = 2;
        }
      }
    }
  }

  // caso base - não tem mais tarefas a serem feitas
  if (indice == -1 && !restaTarefa(tarefas_c, tempo))
    return [];

  // atualiza a duracao e estado do selecionado
  if (indice >= 0) {
    tarefas_c[indice].processado += 1;
    // tarefas_c[indice].estado = 2;
  }

  var saida = [];
  var ret = PRIOc(tarefas_c, indice, tempo + 1);
  // cria um vetor de tarefas e o retorna
  saida.push(tarefas_c);
  for (let r of ret) {
    saida.push(r);
  }
  return saida;
}


function PRIOp(tarefas, tempo = 0) {
  var tarefas_c = structuredClone(tarefas);  // copia vetor de tarefas
  var indice = -1;
  // define um indice
  for (let i = 0; i < tarefas_c.length; i++) {
    // se a tarefa não precisa ser processada, deixa em 0
    if (!precisaProcessar(tarefas_c[i], tempo)) {
      tarefas_c[i].estado = 0;
    } else {
      tarefas_c[i].estado = 1;
      if (indice < 0) { // seleciona uma tarefa qualquer
        indice = i;
        tarefas_c[indice].estado = 2;
      } else if (tarefas_c[i].prioridade > tarefas_c[indice].prioridade) {
        // atualizo a seleção para a tarefa de maior prioridade
        tarefas_c[indice].estado = 1;
        indice = i;
        tarefas_c[indice].estado = 2;
      }
    }
  }


  // caso base - não tem mais tarefas a serem feitas
  if (indice == -1 && !restaTarefa(tarefas_c, tempo))
    return [];

  // atualiza a duracao e estado do selecionado
  if (indice >= 0) {
    tarefas_c[indice].processado += 1;
    // tarefas_c[indice].estado = 2;
  }

  var saida = [];
  var ret = PRIOp(tarefas_c, tempo + 1);
  // cria um vetor de tarefas e o retorna
  saida.push(tarefas_c);
  for (let r of ret) {
    saida.push(r);
  }
  return saida;
}

function PRIOd(tarefas, indice_atual = -1, tempo = 0, quantum = 1) {
  var tarefas_c = structuredClone(tarefas);  // copia vetor de tarefas
  var indice = indice_atual >= 0 && precisaProcessar(tarefas_c[indice_atual], tempo) ? indice_atual : -1;
  // define um indice
  for (let i = 0; i < tarefas_c.length; i++) {
    // se a tarefa não precisa ser processada, deixa em 0
    if (!precisaProcessar(tarefas_c[i], tempo)) {
      tarefas_c[i].estado = 0;
    } else {
      tarefas_c[i].estado = 1;
      if (indice < 0) { // seleciona uma tarefa qualquer
        indice = i;
        tarefas_c[indice].estado = 2;
      } else if (tarefas_c[i].prio_dinamica > tarefas_c[indice].prio_dinamica) {
        // atualizo a seleção para a tarefa de maior prioridade
        tarefas_c[indice].estado = 1;
        indice = i;
        tarefas_c[indice].estado = 2;
      }
    }
  }

  for (let i = 0; i < tarefas_c.length; i++) {
    if(tarefas_c[i].estado == 1){
      tarefas_c[i].prio_dinamica += quantum;
    }
    if(tarefas_c[i].estado == 2){
      tarefas_c[i].prio_dinamica = tarefas_c[i].prioridade;
    }
  }
  
  // caso base - não tem mais tarefas a serem feitas
  if (indice == -1 && !restaTarefa(tarefas_c, tempo))
    return [];

  // atualiza a duracao e estado do selecionado
  if (indice >= 0) {
    tarefas_c[indice].processado += 1;
    tarefas_c[indice].estado = 2;
    // tarefas_c[indice].prio_dinamica = tarefas_c[indice].prioridade;
  }

  var saida = [];
  var ret = PRIOd(tarefas_c, indice, tempo + 1, quantum);
  // cria um vetor de tarefas e o retorna
  saida.push(tarefas_c);
  for (let r of ret) {
    saida.push(r);
  }
  return saida;
}

function precisaProcessar(tarefa, tempo) {
  return (tarefa.processado < tarefa.duracao) && (tarefa.ingresso <= tempo);
}

function restaTarefa(tarefas, tempo) {
  for (let i = 0; i < tarefas.length; i++) {
    if (tarefas[i].ingresso > tempo)
      return true;
  }
  return false;
}

/**
 * Cria o grid com dados para serem representados pelo d3.js na função desenhaGrid.
 * 
 * @param {Array} tarefas Um vetor de tarefas, onde cada índice é "uma passagem de tempo", 
 * com valores das tarefas a cada momento.
 * 
 * @returns Matriz em que cada linha representa uma tarefa para o desenho e cada coluna o 
 * objeto para ser desenhado na tela, de campos x, y, width, height, cor, cor_borda, estado.
 */
function criaGrid(tarefas) {
  let linhas = tarefas[0].length;
  let colunas = tarefas.length;
  var grid = new Array(linhas).fill(null);

  for (let i = 0; i < linhas; i++) {
    var aux = new Array(colunas).fill(null);
    for (let j = 0; j < colunas; j++) {
      // como queremos que o desenho das tarefas seja de ordem
      // de baixo pra cima, acessamos linhas - 1 - i
      const estado = tarefas[j][linhas - 1 - i].estado;
      const [cor, borda] = getColorByState(estado, i);
      aux[j] = {
        x: TAM_QUADRADO * j,
        y: TAM_QUADRADO * i,
        width: TAM_QUADRADO,
        height: TAM_QUADRADO,
        cor: cor,
        cor_borda: borda,
        estado: estado
      };
    }
    // ordena vetor para o d3 poder desenhar os coloridos por último
    aux = aux.sort((a, b) => a.estado > b.estado ? 1 : 0);
    grid[i] = aux;
  }
  return grid;
}

function getColorByState(estado, lin) {
  if (estado == 0) return ["hsl(var(--b1))", "hsl(var(--b3))"];
  if (estado == 1) return ["hsl(var(--b1))", "hsl(var(--ac))"];
  if (estado == 2) return [cores[lin % cores.length], "hsl(var(--ac))"];
}

function desenhaGrid(data) {
  if (row != null)
    row.remove();
  if (col != null)
    col.remove();

  row = canvas.selectAll(".row")
    .data(data)
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
}

</script>
