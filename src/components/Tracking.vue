<template>
    <div class="container">

        <div class="col-sm-4">
            <sidebar></sidebar>
        </div>
        
        <div class="col-sm-8">
            <div class="panel panel-primary">
                <div class="panel-heading text-center header">Prediction Tool</div>
                <div class="panel-body text-center">
                    <div>
                        <label class="text-reader">
                            Select Files
                            <input type="file" multiple class="files">
                        </label>
                    </div>
                    <div><button class="btn-info submit-button" v-on:click="uploadToDatabase">Submit</button></div>
                </div>
                <div class="panel-footer text-center">
                    <div class="footer-spacer">Your personalized best estimated Time</div>
                    <div class="jumbotron calculated-time ">8:30</div>
                </div>
                
            </div>
        </div>
  </div>
</template>


<script>

//Allow sidebar component to be used
import Sidebar from './Sidebar'

	export default {

    components: {'sidebar': Sidebar},

    methods: {
     uploadToDatabase(e) {
        let allFiles = document.querySelector('.files').files;
        let fileDate;
        let fileTime;
        let militaryTime;
        console.log(allFiles);
        //Then access each file's date by doing allFiles[i].lastModifiedDate
        if (allFiles !== null) {
            for (let i = 0; i < allFiles.length; i++) {
                console.log(allFiles.item(i).name);
                fileDate = allFiles.item(i).lastModifiedDate;
                fileTime = fileDate.toLocaleTimeString();
                militaryTime = moment(fileTime).format("H:MM");
                console.log("Date: " + fileDate);
                console.log("Time " + militaryTime);
            }
        }
    }
  }
};

</script>

<style type="text/css">
    .text-reader {
    position: relative;
    overflow: hidden;
    display: inline-block;

    /* Fancy button style 😎 */
    border: 1px solid rgb(0,0,0, .5);
    font-weight: lighter;
    border-radius: 5px;
    padding: 4px 6px;
    font-size: 20px;
    cursor: pointer;
    }

    .text-reader:hover {
        background-color: rgb(220, 220, 220, .6);
        transition: .2s;
    }
    .text-reader input {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    opacity: 0;
    }

    .footer-spacer {
        margin: 10px 0 10px 0;
    }

    .calculated-time {
        font-size: 30px;
    }
    
    .submit-button {
        font-size: 20px;
    }
</style>