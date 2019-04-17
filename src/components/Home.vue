<template>
  <div class="jumbotron jumbotron-fluid">
    <div class="container">
    <img src="../assets/deer_logo_svg.svg" class="img-fluid center-block" width="230px" height="230px">
    <h1 class="display-4 text-center">Predictive Deer Tracker</h1>
    <p class="lead text-center">
      <strong>
        Get started by <a v-bind:href="'/tracking'">uploading your images</a>.
      </strong>
    </p>  
    </div>
  </div>
</template>

<script>
	export default {

	};
</script>

<style type="text/css">
	.jumbotron {
    background: transparent !important;
    border-top: 1px solid rgb(220,220,220, .8);
    border-bottom: 1px solid rgb(220,220,220, .8);
    border-radius: 0 !important;
  }
</style>