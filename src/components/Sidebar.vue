<template>
  <div class="panel-group">
    <div class="panel panel-info info-panel">
      <div class="panel-heading header text-center"> Instructions </div>
      <div class="panel-body"> 
        <ol>
          <li>Select the location of your pictures</li>
          <li>Upload pictures</li>
          <li>Submit!</li>
        </ol>
      </div>
    </div>

    <div class="panel-spacer"></div>

    <div class="panel panel-info">
      <div class="panel-heading header text-center"> Additional Information </div>
      <div class="panel-body"> 
        <ol>
          <li>Select the location of your pictures</li>
          <li>Upload pictures</li>
          <li>Submit!</li>
        </ol>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    props: ['time']
  }
</script>

<style>
  .header {
    font-weight: bold;
    text-transform: uppercase;
  }

  .panel-body {
    height: 30vh;
  }

  .panel-spacer {
    padding-top: 18px;
  }
</style>