
<template>
  <main class="flex flex-col" style="height: 100%;">
    <div class="grow" ref="d3Container" id="d3Container"></div>
    <div id="comandos" class="w-full flex justify-around items-end p-4" style="height: 100px;">
      <div class="join">
        <button class="btn btn-primary join-item" @click="criaProdutor">Adiciona produtor</button>
        <button class="btn btn-primary join-item" @click="remove(produtores)">Remove produtor</button>
      </div>

      <div class="form-control w-100 max-w-xs">
        <label class="label">
          <span class="label-text">Velocidade de animação</span>
        </label>
        <select class="select select-bordered" name="velocidade" id="velocidade" v-model="velocidade">
          <option v-for="opcao in opcoes_vel" :value="1/opcao" :selected="opcao == 1"> {{ opcao }}</option>
        </select>
      </div>

      <div class="join">
        <button class="btn btn-primary join-item" @click="criaConsumidor">Adiciona Consumidor</button>
        <button class="btn btn-primary join-item" @click="remove(consumidores)">Remove Consumidor</button>
      </div>
    </div>
  </main>
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
const TAM_QUADRADO = 50;
const TAM_CIRCULO = 50;
const LARG_BUFFER = 300;
const TAM_BUFFER = 9;
const COL_BUFFER = 3;
const ALT_BUFFER = computed(() =>
  // ALT_BUFFER = 200 <= containerH * 0.8 <= 350 
  Math.max(
    Math.min(containerH.value * 0.8, 350),
    200
  )
);

let canvas = null;
// cada produtor e consumidor será um objeto, criados pela função criaObjeto, de campos: 
// objeto: o objeto/elemento do canvas pra controle, 
// texto: o objeto/elemento do texto do produtor (p + num. produtor),
// seta: o objeto/elemento da setinha que sai de cada produtor pro buffer 
// pos_seta: vetor de posições usadas para desenhar a seta (posição inicial e final),
// sendo que cada uma das posições são um vetor ([coordenada_x, coordenada_y])
let consumidores = [];
let produtores = [];
let leg_prod = null;
let leg_buff = null;
let leg_cons = null;
// se ainda estiver fazendo animação não permitir que adicione/remova do buffer
let animacao = false;
let buffer = {
  indice_c: 0,
  indice_p: 0,
  usado: 0,
  objeto: null,
  conteudo: null,
};
let containerW = ref(null);
let containerH = ref(null);

let fila_prod = ref([]);
let fila_cons = ref([]);

let opcoes_vel = [
  0.25,
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
];

let velocidade = ref(1.0);

watch(fila_prod, () => {

});

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

/**
 * Função chamada uma só vez quando a página é montada.
 */
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  buffer.conteudo = new Array(TAM_BUFFER).fill(null);
  // "cria" canvas 
  canvas = d3.select("#d3Container")
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');
  // e adiciona a possibilidade de setas
  const arrow = d3a.arrow1()
    .id("my-arrow")
    .attr("fill", "hsl(var(--ac))")
    .attr("stroke", "hsl(var(--ac))");
  canvas.call(arrow);
  // textos de legendas
  leg_prod = canvas.append("text").attr("text-anchor", "middle")
    .attr("dx", containerW.value / 8).attr("dy", 20)
    .text("Produtores");
  leg_buff = canvas.append("text").attr("text-anchor", "middle")
    .attr("dx", containerW.value / 2).attr("dy", 20)
    .text("Buffer");
  leg_cons = canvas.append("text").attr("text-anchor", "middle")
    .attr("dx", containerW.value * 7 / 8).attr("dy", 20)
    .text("Consumidores");
  // cria 2 produtores, buffer e 3 consumidores
  criaProdutor();
  criaProdutor();
  desenhaBuffer();
  criaConsumidor();
  criaConsumidor();
  criaConsumidor();
})

/**
 * Posiciona cada um dos produtores no primeiro 1/8 da tela e os distribui  
 * verticalmente igualmente espaçados.  
 */
function desenhaProdutores() {
  let num_prod = produtores.length;
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
    posicionaCirculo(produtores[i], "p" + (i + 1), pos_x, pos_y, ini_seta, fim_seta);
  }
}

/**
 * Posiciona cada um dos consumidores no último 1/8 da tela e os distribui  
 * verticalmente igualmente espaçados.  
 */
function desenhaConsumidores() {
  let num_con = consumidores.length;
  for (let i = 0; i < num_con; i++) {
    // queremos que cada item tenha um espaço proporcional entre si e ao mesmo tempo 
    // centralizado, então para que não fique nos extremos dividimos por num. total + 1
    let proporcao = (i + 1) / (num_con + 1)
    let pos_x = containerW.value * 7 / 8; // fica em 7/8 da tela 
    let pos_y = containerH.value * proporcao;
    let pos_buff_x = containerW.value / 2 + LARG_BUFFER / 2;
    let fim_seta = [pos_x - (TAM_CIRCULO + 10), pos_y];
    let ini_seta = [pos_buff_x + 10, (containerH.value - ALT_BUFFER.value) / 2 + proporcao * ALT_BUFFER.value];
    posicionaCirculo(consumidores[i], "c" + (i + 1), pos_x, pos_y, ini_seta, fim_seta);
  }
}

/**
 * Faz a animação de quando se adiciona um produtor ou consumidor no canvas e atualiza 
 * o campo pos_seta do [item].
 * 
 * @param {Object} item Object com campos objeto, texto, seta e pos_seta.
 * @param {String} nome Nome do objeto, que será escrito no campo texto do [item].
 * @param {Number} pos_x Posição horizontal do elemento do canvas do campo ojeto do [item].
 * @param {Number} pos_y Posição vertical do elemento do canvas do campo objeto do [item].
 * @param {Array} seta_ini Array, com coord. das [<pos. vert.>, <pos. horiz.>] inicial da seta do [item].
 * @param {Array} seta_fim Array, com coord. das [<pos. vert.>, <pos. horiz.>] final da seta do [item].
 */
function posicionaCirculo(item, nome, pos_x, pos_y, seta_ini, seta_fim) {
  item.objeto // atualiza a pos. do item
    .transition().duration(velocidade.value * 250).attr("cx", pos_x).attr("cy", pos_y);
  item.texto // atualiza o texto do item
    .transition().duration(velocidade.value * 250).text(nome)
    .attr("dx", pos_x).attr("dy", pos_y + 8);
  // cria a seta se ainda não fora feito
  if (item.seta == null) {
    item.seta = canvas.append("polyline")
      .attr("marker-end", "url(#my-arrow)")
      .attr("stroke", "hsl(var(--ac))")
      .attr("stroke-width", 2);
  }
  item.seta // faz animação da seta p nova pos. e atualiza pos_seta
    .transition().duration(velocidade.value * 250)
    .attr("stroke", "hsl(var(--ac))")
    .attr("points", [seta_ini, seta_fim]);
  item.pos_seta = [seta_ini, seta_fim];
}

/**
 * Função chamada quando se clica em um produtor. Faz com que seja criado um item na pos. 
 * indice_p a ser salvo no buffer no meio de sua seta e os anima até a ponta da mesma.
 * Ao final é chamado desenhaBuffer para o posicionar corretamente dentro do buffer.
 *  
 * @param {Object} event Evento que se é passado pelo d3.js para execução.
 */
function clickProdutor(event) {
  if (animacao || buffer.usado >= TAM_BUFFER) {
    fila_prod.value.push(event);
    return;
  }

  animacao = true;

  let index = parseInt(event.srcElement.id);
  let pos_seta = produtores[index].pos_seta;
  // a posição inicial do quadradinho é o meio da seta - TAM_QUADRADO / 2 pra centralizar
  let pos_x1 = (pos_seta[0][0] + pos_seta[1][0]) / 2 - TAM_QUADRADO / 2;
  // e um pouco acima do meio
  let pos_y1 = (pos_seta[0][1] + pos_seta[1][1]) / 2 - (TAM_QUADRADO * 3 / 2);
  // cria no meio da seta
  let item = canvas.append("rect")
    .attr("width", TAM_QUADRADO)
    .attr("height", TAM_QUADRADO)
    .attr("stroke-width", 4)
    .style("stroke", "hsl(var(--ac))")
    .style("fill", cores[index])
    .attr("x", pos_x1)
    .attr("y", pos_y1);
  item // faz animação até o final da seta
    .transition().delay(velocidade.value * 250).duration(velocidade.value * 1000)
    .attr("x", containerW.value / 2 - LARG_BUFFER / 2)
    .attr("y", pos_seta[1][1] - (TAM_QUADRADO + 10));
  // atualiza conteúdo do buffer, o num de elementos usados e 
  // o índice do item em que os produtores irão produzir
  buffer.conteudo[buffer.indice_p] = item;
  buffer.usado += 1;
  buffer.indice_p = (buffer.indice_p + 1) % TAM_BUFFER;
  desenhaBuffer(1250);
  liberaBuffer(velocidade.value * 1750);
}

/**
 * Função passada para cada um dos consumidores. Remove do buffer o item na pos. indice_c 
 * e faz uma animção saindo do buffer, passando pela seta do consumidor até ser "consumido"
 * pelo mesmo.
 * 
 * @param {object} event Evento que se é passado pelo d3.js para execução.
 */
function clickConsumidor(event) {
  // está em animação ou buffer vazio
  if (animacao || buffer.usado == 0) {
    fila_cons.value.push(event);
    return;
  }
  animacao = true;

  let index = parseInt(event.srcElement.id);
  let item = buffer.conteudo[buffer.indice_c];
  buffer.conteudo[buffer.indice_c] = null;
  let pos_seta = consumidores[index].pos_seta;
  item.transition().duration(velocidade.value * 500)
    .attr("x", pos_seta[0][0] - (TAM_QUADRADO / 2))
    .attr("y", pos_seta[0][1] - (TAM_QUADRADO * 3 / 2));
  item.transition().delay(velocidade.value * 500).duration(velocidade.value * 1000)
    .attr("x", pos_seta[1][0] - (TAM_QUADRADO / 2))
    .attr("y", pos_seta[1][1] - (TAM_QUADRADO * 3 / 2));
  item.transition().delay(velocidade.value * 1500).duration(velocidade.value * 500)
    .attr("x", pos_seta[1][0] + (10 + TAM_CIRCULO / 2))
    .attr("y", pos_seta[1][1] - TAM_CIRCULO / 2)
    .remove();

  buffer.indice_c = (buffer.indice_c + 1) % TAM_BUFFER;
  buffer.usado -= 1;
  liberaBuffer(velocidade.value * 2000);
}

/**
 * Cria um timeout que ao executar libera o estado de animação e caso tenha elementos na fila de 
 * produtores ou consumidores realiza a animação dos mesmos. 
 * Como as animações são executadas novamente, acaba se criando uma recursão, que faz com que o 
 * algoritmo dê preferência de esvaziar a fila de produtores antes da fila de consumidores.
 * @param {Number} tempo Tempo de espera para se chamar o timeout. 
 */
function liberaBuffer(tempo) {
  setTimeout(() => {
    animacao = false;
    if (fila_prod.value.length > 0) {
      let evento = fila_prod.value.shift();
      clickProdutor(evento);
    }
    if (fila_cons.value.length > 0) {
      let evento = fila_cons.value.shift();
      clickConsumidor(evento);
    }
  }, tempo);
}


/**
 * Desenha o buffer e os itens nele.
 * 
 * @param {Number} delay_animacao Tempo de delay para começar a fazer animação dos itens
 * no buffer.
 */
function desenhaBuffer(delay_animacao = 0) {
  // atualiza legendas
  leg_prod.attr("dx", containerW.value / 8).attr("dy", 20);
  leg_buff.attr("dx", containerW.value / 2).attr("dy", 20);
  leg_cons.attr("dx", containerW.value * 7 / 8).attr("dy", 20);


  if (buffer.objeto == null) { // cria buffer
    buffer.objeto = canvas.append("rect")
      .attr("width", LARG_BUFFER)
      .attr("height", ALT_BUFFER.value)
      .attr("stroke-width", 5)
      .attr("stroke", "hsl(var(--ac))")
      .attr("fill", "hsl(var(--nc))")
      .attr("x", containerW.value / 2 - LARG_BUFFER / 2)
      .attr("y", containerH.value / 2 - ALT_BUFFER.value / 2)
  }
  // a posição para se desenha um rect se define à partir do seu canto superior esquerdo
  // então é no meio da tela - metade do tamanho do objeto
  buffer.objeto
    .transition()
    .duration(velocidade.value * 500)
    .attr("width", LARG_BUFFER)
    .attr("height", ALT_BUFFER.value)
    .attr("x", containerW.value / 2 - LARG_BUFFER / 2)
    .attr("y", containerH.value / 2 - ALT_BUFFER.value / 2);

  const LIN_BUFFER = TAM_BUFFER / COL_BUFFER;
  const metade_quadrado = TAM_QUADRADO / 2;
  // desenha os itens do buffer
  for (let i = 0; i < buffer.conteudo.length; i++) {
    if (buffer.conteudo[i] == null)
      continue;
    // como será desenhado como uma matriz, então tem que transformar pos de vetor em matriz:
    // V[i] = M[i % num colunas][i / num colunas] 

    // diff_x = num de colunas - pos do item na matriz * 2
    let diff_x = COL_BUFFER - parseInt(i % COL_BUFFER) * 2;
    // pos final em x é metade da largura tela - diff_x * tam. quadrado / 2
    let pos_x = containerW.value / 2 - diff_x * metade_quadrado;

    // diff_y = num de linhas - pos do item na matriz * 2
    let diff_y = LIN_BUFFER - parseInt(i / COL_BUFFER) * 2;
    // pos final em y é metade da altura da tela - diff_y * tam. quadrado / 2
    let pos_y = containerH.value / 2 - diff_y * metade_quadrado;

    buffer.conteudo[i]
      .transition()
      .delay(velocidade.value * delay_animacao)
      .duration(velocidade.value * 500)
      .attr("x", pos_x)
      .attr("y", pos_y);
  }
}

/**
 * Cria objeto de um produtor se ainda tiver cor "disponível".
 */
function criaProdutor() {
  if (produtores.length >= cores.length)
    return;

  let p = criaObjeto(
    containerW.value / 8,
    containerH.value + 100,
    produtores.length,
    cores[produtores.length]
  );
  p.objeto.on("click", clickProdutor);
  p.texto.on("click", clickProdutor);
  produtores.push(p);
  desenhaProdutores();
}

/**
 * Cria objeto de um consumidor.
 */
function criaConsumidor() {
  if (consumidores.length >= cores.length)
    return;
  let c = criaObjeto(
    containerW.value * 7 / 8,
    containerH.value + 100,
    consumidores.length
  );
  c.objeto.on("click", clickConsumidor);
  c.texto.on("click", clickConsumidor);
  consumidores.push(c);
  desenhaConsumidores();
}

/**
 * Cria um objeto que possa ser adicionado ao vetor de produtores ou consumidores.
 * 
 * @param {Number} pos_x Posição horizontal do objeto e texto a ser criado.
 * @param {Number} pos_y Posição vertical do objeto e texto a ser criado.
 * @param {Number} id Índice do objeto em seu respectivo vetor que será salvo como id do objeto.
 * @param {String} cor Opcional. Cor a ser usada. Por padrão utiliza hsl(var(--a)). 
 * 
 * @returns {Object} Um objeto com os seguintes campos:
 * objeto: o objeto/elemento do canvas de um produtor/consumidor, 
 * texto: o objeto/elemento do texto do produtor (sem texto definido),
 * seta: null
 * pos_seta: null
 */
function criaObjeto(pos_x, pos_y, id, cor = "hsl(var(--a))") {
  var objeto = canvas.append("circle")
    .attr("r", TAM_CIRCULO)
    .style("stroke-width", 5)
    .attr("cx", pos_x)
    .attr("cy", pos_y)
    .attr("id", id)
    .style("stroke", "hsl(var(--ac))")
    .style("fill", cor)
    .style("cursor", "pointer");

  var texto = canvas.append("text")
    .attr("text-anchor", "middle")
    .attr("dx", pos_x)
    .attr("dy", pos_y)
    .text("")
    .attr("id", id)
    .style("cursor", "pointer");
  texto.style('fill', 'hsl(var(--ac))');

  return {
    objeto: objeto,
    texto: texto,
    seta: null,
    pos_seta: null
  };
}

/**
 * Remove de um vetor de produtores ou consumidores seu último item e 
 * atualiza os elementos presentes no canvas. 
 * 
 * @param {Array} vetor Vetor de produtores ou consumidores no qual se deseja 
 * remover um elemento.
 */
function remove(vetor) {
  if (vetor.length <= 1)
    return;

  var p = vetor.pop();
  p.objeto.remove();
  p.texto.remove();
  if (p.seta != null)
    p.seta.remove();

  desenhaProdutores();
  desenhaConsumidores();
}

function handleResize() {
  containerW.value = document.getElementById("d3Container").offsetWidth;
  containerH.value = document.getElementById("d3Container").offsetHeight;
}

</script>
