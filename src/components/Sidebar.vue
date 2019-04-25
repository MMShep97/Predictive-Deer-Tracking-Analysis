<template>
  <div class="panel-group information-group">
    <div class="panel panel-info info-panel">
      <div class="panel-heading header text-center"> Instructions </div>
      <div class="panel-body"> 
        <ol class="instructions">
          <li>Set your ZIP Code to the the location of the images you will be uploading.</li>
          <!-- <ul>
          <li>Input the latitude, longitude coords </li>
          <li>Make sure 91.47° W becomes -91.47</li>
          </ul> -->
          <li>Click on the <i>"Select Files"</i> button to open up your file directory. 
              From there, select every picture you want analyzed. 
              
          </li>
          <!-- <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          </ul>  -->
          <li>Hit the <i>"Submit"</i> button. Everything will be processed and the progress bar will keep
              you updated on the status of the analysis!
          </li>
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
      <div class="panel-body additional-information"> 
        <ul>
          <li><i>Helpful Tip:</i> ctrl + click selects a new file while keeping the previous files selected.
                                  You can also use shift + click as a powerfully similar selection tool.
          </li>
          <li>Expect longer wait times the more files you choose to upload.</li>
          <li>In very rare circumstances, the zip code you provide may not work. 
              Use a different ZIP!
          </li>
        </ul>
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

  .information-group {
    font-size: 13px;
  }

  .header {
    font-weight: bold;
    text-transform: uppercase;
  }

  .header-small {
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .panel-spacer {
    padding-top: 12px;
  }
</style>