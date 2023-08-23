<template>
  <div ref="d3Container"></div>

</template>

<script>
import * as d3 from 'd3';

export default {
  mounted() {
    this.createWelcomePage();
  },
  methods: {
    createWelcomePage() {
    d3.select(this.$refs.d3Container)
      .append('p').style('color', 'red')
      .text('VISUAL SO');
    var canvas = d3.select(this.$refs.d3Container)
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);


    var circle = canvas.append('circle')
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

    circle.on('mouseover', function() {
      d3.select(this)
        .transition()
        .attr('r', 100)
        .attr('fill', 'green');
    });


    circle.on('mouseout', function() {
      d3.select(this)
        .transition()
        .attr('r', 50)
        .attr('fill', 'red');
    });

    circle.on('click', function() {
      d3.select(this)
        .transition()
        .attr('r', 200)
        .attr('fill', 'yellow');
    });
    }
  }
}
</script>
