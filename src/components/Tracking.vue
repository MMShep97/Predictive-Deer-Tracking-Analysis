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
                        <div><label class="text-center">Enter ZIP Code pictures were taken in</label></div>
                        <input v-model="zip" type="number" placeholder="e.g. 11103" class="text-center">{{zip}}
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
                <div class="panel-footer text-center">
                    <div class="footer-spacer">Your personalized best estimated Time</div>
                    <div class="jumbotron calculated-time">{{prediction}}</div>
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
            //location
            zip: "",
            lat: "",
            long: "",
            
            //date - time
            year: [],
            month: [],
            day: [],
            hour: [],
            minute: [],
            startDate: [], //used for NOAA API in function below
            endDate: [],

            //extras
            temperature: ["", ""],
            imageID: [],
            imageCount: 0,
            prediction: "8:30",
        }
    },

    methods: {

        //overarching function, parses, uses (database.js) functions to find temperature, uploads data to database
        getFileData(e) {
            let allFiles = document.querySelector('.files').files;
            let fileDate, startDate, endDate; 
            let FIPS, temperature;
            let timeout = 0;
        
            //Then access each file's date by doing allFiles[i].lastModifiedDate
            if (allFiles !== null) {
                for (let i = 0; i < allFiles.length; i++) {
                    fileDate = allFiles.item(i).lastModifiedDate;
                    this.year.push(fileDate.getFullYear());
                    this.month.push(fileDate.getMonth() + 1); //0 indexed
                    this.day.push(fileDate.getDate());
                    this.hour.push(fileDate.getHours());
                    this.minute.push(fileDate.getMinutes());
                    this.imageID.push(this.imageCount++);

                    //only need temp for one day, append 0 to month if < 10
                    this.month[i] < 10 ? this.month[i] = `0${this.month[i]}` : this.month[i];
                    this.day[i] < 10 ? this.day[i] = `0${this.day[i]}` : this.day[i];
                    this.startDate.push(`${this.year[i]}-${this.month[i]}-${this.day[i]}`);
                    this.endDate.push(`${this.year[i]}-${this.month[i]}-${this.day[i]}`);

                    //Debugging
                    console.log("Date: " + fileDate);
                    console.log("Year: " + this.year + " | " + 
                                "Month: " + this.month + " | " + 
                                "Day: " + this.day + " | " + 
                                "Hour: " + this.hour + " | " + 
                                "Minute: " + this.minute);
                    console.log("ImageID: " + this.imageID[i]);
                }

                for (let i = 0; i < allFiles.length; i++) {
                    timeout += 2000;
                    //Get temperature from NOAA API and upload everything to firebase (imported from database.js)
                    setTimeout(database.getTemperatureAndUpload, timeout, 
                                    this.zip, this.startDate[i], this.endDate[i], 'GHCND', database.uploadToFirestore, 
                                        [ this.year[i], this.month[i], this.day[i], this.hour[i], this.minute[i], this.imageID[i] ]
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
        font-size: 15px;
    }
</style>