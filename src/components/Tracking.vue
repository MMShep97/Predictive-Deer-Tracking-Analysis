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
                        <div><label class="text-center">Enter Location of Property</label></div>
                        <input v-model="lat" type="number" placeholder="Latitude" class="text-center">{{lat}}
                        <input v-model="long" type="number" placeholder="Longitude" class="text-center">{{long}}
                    </div>
                    <div class="file-input">
                        <label class="text-reader">
                            Select Files
                            <input type="file" multiple class="files">
                        </label>
                    </div>
                    <div class="button-container"><button class="btn-info submit-button" v-on:click="processFiles">Submit</button></div>
                </div>
                <div class="panel-footer text-center">
                    <div class="footer-spacer">Your personalized best estimated Time</div>
                    <div class="jumbotron calculated-time">8:30</div>
                </div>
                
            </div>
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
            lat: "",
            long: "",
        }
    },

    methods: {
    
        //overarching function, parses, uses database functions to find temperature, uploads data to database
        processFiles(e) {
            let allFiles = document.querySelector('.files').files;
            let fileDate;
            let startDate, endDate; //used for NOAA API in function below
            let year, month, day, hour, minute;
            let fileTime;
            let militaryTime;
            let FIPS, temperature;
        
            //Then access each file's date by doing allFiles[i].lastModifiedDate
            if (allFiles !== null) {
                for (let i = 0; i < allFiles.length; i++) {
                    fileDate = allFiles.item(i).lastModifiedDate;
                    year = fileDate.getFullYear();
                    month = fileDate.getMonth() + 1; //0 indexed
                    day = fileDate.getDate();
                    hour = fileDate.getHours();
                    minute = fileDate.getMinutes();

                    //only need temp for one day, append 0 to month if < 10
                    month < 10 ? month = `0${month}` : month;
                    day < 10 ? day = `0${day}` : day;
                    startDate = `${year}-${month}-${day}`;
                    endDate = startDate;
                    console.log("Start date: " + startDate);

                    //Debugging
                    console.log("Date: " + fileDate);
                    console.log("Year: " + year + " | " + 
                                "Month: " + month + " | " + 
                                "Day: " + day + " | " + 
                                "Hour: " + hour + " | " + 
                                "Minute: " + minute);

                    //Actually upload to firebase (imported from database.js)
                    //FIPS = database.latLong2Fips(this.lat, this.long);
                    temperature = database.getTemperature('23', startDate, endDate, 'GHCND'); //GHCND = dataset for daily summaries
                    //database.uploadToDatabase(year, month, day, hour, minute, temperature);
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

    .small-spacer {
        margin-bottom: 10px;
    }

    .footer-spacer {
        margin: 10px 0 10px 0;
    }

    .calculated-time {
        font-size: 30px;
    }
    
    .button-container {
        margin-bottom: 15px;
    }
    .submit-button {
        font-size: 20px;
    }
</style>