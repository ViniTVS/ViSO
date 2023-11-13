<script setup lang="ts">

useHead({
  title: 'Inicio - VisualSO'
});

</script>

<template>
  <div class="container mx-auto">
    <header class="my-10" style="text-align: center;">
      <h1>VisualSO</h1>
      <p>VisualSO é uma Prova de Conceito de forma a trazer uma abordagem inicial
        de um sistema de representação visual e interação para tornar a
        aprendizagem de Sistemas Operacionais mais interativa e imersiva.</p>
    </header>

    <section id="explorar" class="mx-2">
      <h2>Animações</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4 mx-2">
        <NuxtLink to="/algoritmos/produtor">
          <div class="card card-compact w-full bg-base-100 shadow-xl">
            <figure><img src="/produtor.png" alt="Shoes" /></figure>
            <div class="card-body">
              <h2 class="card-title">Sistema Produtor-consumidor</h2>
              <p>
                Um sistema produtor-consumidor, é um padrão de comunicação entre processos ou <i>threads</i> em um
                ambiente concorrente, usado para facilitar a troca de dados entre diferentes <i>threads</i> de um
                programa.
              </p>
            </div>
          </div>
        </NuxtLink>
        <NuxtLink to="/algoritmos/escalonamento">
          <div class="card card-compact w-full bg-base-100 shadow-xl">
            <figure><img src="/tarefas.png" alt="Shoes" /></figure>
            <div class="card-body">
              <h2 class="card-title">Escalonamento de tarefas</h2>
              <p>
                Um escalonador de tarefas é um componente do sistema operacional responsável por gerenciar o uso do
                processador por múltiplos processos ou <i>threads</i> concorrentemente, determinando a ordem em que
                os processos são executados e quanto tempo cada um deles pode utilizar a CPU.
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

  </div>
</template>

<style>
h1 {
  font-size: 5rem;
  background-image: linear-gradient(90deg, hsl(var(--a)), hsl(var(--p)) 90%);
  background-clip: text;
  color: transparent;
  font-weight: bolder;
  font-stretch: 200%;
  background-repeat: repeat;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-background-clip: text;
  -moz-text-fill-color: transparent;
}

h2 {
  font-size: 2rem;
}
</style>