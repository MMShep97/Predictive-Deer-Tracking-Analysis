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
            </div>
                <div class="result-section jumbotron">
                    <div class="col-sm-4 text-center">Result</div>
                    <div class="col-sm-4 text-center">Result</div>
                    <div class="col-sm-4 text-center">Result</div>
                </div>

                    <div id="myProgress">
                        <div id="myBar"></div>
                    </div>
                    <div class="progress-text text-center"> {{progressAccumulation}}</div>
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
            progressIncrement: 0,
            progressAccumulation: 0,
            progressTotal: 0,
        }
    },

    watch: {
        //For progress bar, stylizing/updates
        progressAccumulation: function() {
            document.querySelector('#myBar').style.width = `${this.progressAccumulation}%`;
            document.querySelector('#myProgress').style.opacity = 1.0;
        }
    },

    methods: {

        //overarching function, parses, uses (database.js) functions to find temperature, uploads data to database
        async getFileData(e) {
            let allFiles = document.querySelector('.files').files;
            let fileDate;
            let FIPS;
            let timeout = 0;

            this.progressIncrement = allFiles.length * .01;
            this.progressTotal = allFiles.length;

            //date - time
            let year = [];
            let month = [];
            let day = [];
            let dayOfYear = [];
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

                    //only need temp for one day, append 0 to month if < 10 (formatting for NOAA API)
                    month[i] < 10 ? month[i] = `0${month[i]}` : month[i];
                    day[i] < 10 ? day[i] = `0${day[i]}` : day[i];
                    startDate.push(`${year[i]}-${month[i]}-${day[i]}`);
                    endDate.push(`${year[i]}-${month[i]}-${day[i]}`);

                    //Getting day with respect the year (out of 365)
                    var start = new Date(fileDate.getFullYear(), 0, 0);
                    var diff = (fileDate - start) + ((start.getTimezoneOffset() - fileDate.getTimezoneOffset()) * 60 * 1000);
                    var oneDay = 1000 * 60 * 60 * 24;
                    dayOfYear.push(Math.floor(diff / oneDay));
                    console.log('Day of year: ' + dayOfYear[i]);

                    //Debugging
                    console.log("Year: " + year[i] + " | " + 
                                "Month: " + month[i] + " | " + 
                                "Day: " + day[i] + " | " + 
                                "Hour: " + hour[i] + " | " + 
                                "Minute: " + minute[i] + " | " + 
                                "ImageID: " + imageID[i]);
                }

               let temperaturePromises = [];
               let firestorePromises = [];
               let temperatures = [];

                //Creates promise function, allowing setTimeout to be used properly with api calls
               const wait = (timeout) => new Promise(
                (resolve, reject) => setTimeout(resolve, timeout)
                );

                    for (let i = 0; i < allFiles.length; i++) {
                        console.log("before function");
                        //Get temperature from NOAA API and upload everything to firebase (imported from database.js)
                        temperaturePromises.push(database.getTemperature(this.zip, startDate[i], endDate[i], 'GHCND'));  
                        await wait(200); 
                        this.progressAccumulation += 1;
                    }

                    //Wait for every api call to get their temperatures, then return them all into one promise
                    //THEN, set that return value to temperatures array to use below
                    await Promise.all(temperaturePromises).then(function(temp) {
                        temperatures = temp;
                        console.log("In then part");
                    });

                console.log(temperatures);
                
                

                for (let i = 0; i < allFiles.length; i++) {
                    // console.log("HIGH: " + temperatures[i][1] + " | " + 
                    //             "LOW: " + temperatures[i][0] + " | " + 
                    //             "Year: " + year[i] + " | " + 
                    //             "Month: " + month[i] + " | " + 
                    //             "Day: " + day[i] + " | " + 
                    //             "Hour: " + hour[i] + " | " + 
                    //             "Minute: " + minute[i] + " | " + 
                    //             "ImageID: " + imageID[i]);
                    firestorePromises.push(database.uploadToFirestore(year[i], month[i], day[i], dayOfYear[i], hour[i], minute[i],
                                                                      imageID[i], temperatures[i][0], temperatures[i][1])
                                           );
                }

                //Wait for all images to be uploaded, then proceed
                await Promise.all(firestorePromises);
                
                //Do calculation once firestore finishes uploading
            }
        },

        
    }
};

                //for (let i = 0; i < allFiles.length; i++) {
            //         timeout += 350;

            //         //Get temperature from NOAA API and upload everything to firebase (imported from database.js)
            //         // setTimeout(database.getTemperatureAndUpload, timeout, 
            //         //                 this.zip, startDate[i], endDate[i], 'GHCND', database.uploadToFirestore, 
            //         //                     [ year[i], month[i], day[i], hour[i], minute[i], imageID[i] ]
            //         // );
            //    }
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

    /*Progress bar*/
    #myProgress {
        width: 100%;
        background-color: grey;
        opacity: .3;
        transition: all 3s linear;
    }

    #myBar {
        width: 0%;
        height: 15px;
        background-color: forestgreen;
        transition: all .3s linear;
    }
</style>


