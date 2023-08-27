
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

<script >

import * as d3 from "d3";

useHead({
  title: 'Produtor-consumidor - VisualSO'
});

export default {
  mounted() {
    this.createWelcomePage();
    // this.criaCirculo();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  data() {
    return {
      canvas: null,
      containerW: null,
      containerH: null,
      produtos: [],
      buffer: [],
      consumidos: [],
    }
  },
  watch: {
    produtos(novo) {
      console.log(novo);
    }
  },
  methods: {
    createWelcomePage() {

      this.canvas = d3.select(this.$refs.d3Container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    },
    handleResize() {
      this.containerW = document.getElementById("d3Container").offsetWidth;
      this.containerH = document.getElementById("d3Container").offsetHeight;
      this.desenhaProdutos();
    },
    addProduto() {
      if(this.produtos.length >=5)
        return;
      var produto = this.canvas.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr('x', this.containerW / 4)
        .attr('y', this.containerH * 0.60 - 30 * this.produtos.length)
        .attr('fill', 'green');

      this.produtos.push(produto);

    },
    removeProduto(){
      if (this.produtos.length < 1)
        return;

      this.produtos[0].remove();
      this.produtos.shift();

      for(let i =0; i< this.produtos.length; i++){
        this.produtos[i]
        .transition()
        .duration(1500)
          .attr('x', this.containerW / 4)
          .attr('y', this.containerH * 0.60 -  30 * i);
      }
    },
    desenhaProdutos() {
      for(let i =0; i< this.produtos.length; i++){
        this.produtos[i]
          .attr('x', this.containerW / 4)
          .attr('y', this.containerH * 0.60 -  30 * i);
      }
    },

    criaCirculo() {
      var circle = this.canvas.append('circle')
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



  },
}

</script>
