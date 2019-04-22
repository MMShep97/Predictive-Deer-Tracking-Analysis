<template>
  <div class="panel-group">
    <div class="panel panel-info info-panel">
      <div class="panel-heading header text-center"> Instructions </div>
      <div class="panel-body"> 
        <ol>
          <li>Set the location your pictures were taken!</li>
          <ul>
          <li>Input the latitude, longitude coords </li>
          <li>Make sure 91.47° W becomes -91.47</li>
          </ul>
          <li>Upload pictures</li>
          <!-- <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          </ul>  -->
          <li>Select the Location of your Pictures!</li>
          <!-- <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          </ul> -->
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