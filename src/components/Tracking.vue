<template>
    <div class="container">

        <div class="col-sm-4">
            <sidebar></sidebar>
        </div>
        
        <div class="col-sm-8">
            <div class="panel panel-primary">
                <div class="panel-heading text-center header">Prediction Tool</div>
                <div class="panel-body text-center">
                    <div class="location-input small-spacer"> 
                        <div><label class="text-center small-spacer">Enter ZIP Code pictures were taken in</label></div>
                        <input v-model="zip" type="number" placeholder="e.g. 11103" class="text-center">
                        <!-- <input v-model="long" type="number" placeholder="Longitude" class="text-center">{{long}} -->
                    </div>
                    <div class="file-input">
                        <label class="text-reader">
                            Select Files
                            <input type="file" multiple class="files">
                        </label>
                    </div>
                    <div class="button-container"><button class="btn-info submit-button" v-on:click="getFileData">Submit</button></div>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading text-center header-small">Results</div>
                    <div class="">
                        <div class="col-sm-3 jumbotron text-center">Result</div>
                        <div class="col-sm-3 jumbotron text-center">Result</div>
                        <div class="col-sm-3 jumbotron text-center">Result</div>
                        <div class="col-sm-3 jumbotron text-center">Result</div>
                    </div>
            </div>
            <!-- <div class="panel panel-default text-center">
                <div class="panel-heading text-center header">Result</div>
                <div class="panel-body text-center">
                    
                </div>
            </div> -->
        </div>
  </div>
</template>


<script>
//Allow sidebar component to be used
import Sidebar           from './Sidebar'
//moment for date formatting
import moment            from 'moment'
//for uploading to firebase and helper functions
import * as database     from '../database'  

	export default {

    components: {'sidebar': Sidebar},

    data: function() {
        return {
            //location
            zip: "",
            lat: "",
            long: "",

            //extras
            prediction: "8:30",
        }
    },

    methods: {

        //overarching function, parses, uses (database.js) functions to find temperature, uploads data to database
        getFileData(e) {
            let allFiles = document.querySelector('.files').files;
            let fileDate;
            let FIPS;
            let timeout = 0;

            //date - time
            let year = [];
            let month = [];
            let day = [];
            let hour = [];
            let minute = [];
            let startDate = []; //used for NOAA API in function below
            let endDate = [];
            let imageID = [];
            let imageCount = 0;

            //Then access each file's date by doing allFiles[i].lastModifiedDate
            if (allFiles !== null) {
                for (let i = 0; i < allFiles.length; i++) {
                    fileDate = allFiles.item(i).lastModifiedDate;
                    year.push(fileDate.getFullYear());
                    month.push(fileDate.getMonth() + 1); //0 indexed
                    day.push(fileDate.getDate());
                    hour.push(fileDate.getHours());
                    minute.push(fileDate.getMinutes());
                    imageID.push(imageCount++);

                    //only need temp for one day, append 0 to month if < 10
                    month[i] < 10 ? month[i] = `0${month[i]}` : month[i];
                    day[i] < 10 ? day[i] = `0${day[i]}` : day[i];
                    startDate.push(`${year[i]}-${month[i]}-${day[i]}`);
                    endDate.push(`${year[i]}-${month[i]}-${day[i]}`);

                    //Debugging
                    console.log("Date: " + fileDate);
                    console.log("Year: " + year + " | " + 
                                "Month: " + month + " | " + 
                                "Day: " + day + " | " + 
                                "Hour: " + hour + " | " + 
                                "Minute: " + minute);
                    console.log("ImageID: " + imageID);
                }

                for (let i = 0; i < allFiles.length; i++) {
                    timeout += 350;
                    //Get temperature from NOAA API and upload everything to firebase (imported from database.js)
                    setTimeout(database.getTemperatureAndUpload, timeout, 
                                    this.zip, startDate[i], endDate[i], 'GHCND', database.uploadToFirestore, 
                                        [ year[i], month[i], day[i], hour[i], minute[i], imageID[i] ]
                    );
               }
            }
        },
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
    font-size: 15px;
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

    .small-spacer {
        margin-bottom: 10px;
    }

    .medium-spacer-top {
        margin-top: 30px;
    }

    .footer-spacer {
        margin: 10px 0 10px 0;
    }

    .result {
        text-decoration: underline;
    }

    .calculated-time {
        font-size: 30px;
    }
    
    .button-container {
        margin-bottom: 15px;
    }
    .submit-button {
        font-size: 15px;
    }
</style>