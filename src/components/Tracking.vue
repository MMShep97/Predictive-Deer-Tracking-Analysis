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
                        <input v-model="zip" type="number" placeholder="e.g. 52162" class="text-center">
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
                    <div class="col-sm-6 text-center deer-given-time">
                        <div class="deer-given-time-result"></div>
                    </div>
                    <div class="col-sm-6 text-center deer-given-day-time">
                        <div class="deer-given-day-time-result"></div>
                    </div>
                </div>

                <div id="myProgress">
                    <div id="myBar" class="text-center">{{progressAccumulation}}%</div>
                </div>
                <div class="progress-text text-center"></div>
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
            pDeerGivenDayTime: 5,
            pDeerGivenTime: 5,
        }
    },

    watch: {
        //For progress bar, stylizing/updates
        progressAccumulation: function() {
            document.querySelector('#myBar').style.width = `${this.progressAccumulation}%`;
            document.querySelector('#myProgress').style.opacity = 1.0;
        },
        //prints predictive result
        pDeerGivenDayTime: function() {
            document.querySelector('.deer-given-day-time').innerHTML = 
            `<strong>Probability of Deer Given Daytime</strong> <div>${this.pDeerGivenDayTime}</div>`;
        },
        //prints predictive result
        pDeerGivenTime: function() {
            document.querySelector('.deer-given-time').innerHTML = 
            `<strong>Probability of Deer Given Time</strong> <div>${this.pDeerGivenTime}</div>`;
        }
    },

    methods: {

        //overarching function, parses, uses (database.js) functions to find temperature, uploads data to database, does bayesian
        async getFileData(e) {
            let allFiles = document.querySelector('.files').files;
            let fileDate;
            let FIPS;
            let timeout = 0;

            //Use total as the constraint for progress bar to increase, add inc to total everytime constraint is reached
            this.progressIncrement = allFiles.length * .01;
            this.progressTotal = this.progressIncrement;

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
            let averageHighTemp = [23, 29, 42, 57, 69, 78, 82, 79, 72, 60, 43, 28];
	        let averageLowTemp = [6, 12, 23, 36, 47, 57, 61, 59, 50, 39, 26, 12];

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

                    //Debugging
                    // console.log("Year: " + year[i] + " | " + 
                    //             "Month: " + month[i] + " | " + 
                    //             "Day: " + day[i] + " | " + 
                    //             "Hour: " + hour[i] + " | " + 
                    //             "Minute: " + minute[i] + " | " + 
                    //             "ImageID: " + imageID[i]);
                }

                //Get difference b/w earliest and latest file dates
                const earliestFileDate = allFiles.item(0).lastModifiedDate;
                const latestFileDate = allFiles.item(allFiles.length - 1).lastModifiedDate;
                const diffTime = Math.abs(latestFileDate.getTime() - earliestFileDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

               let temperaturePromises = [];
               let firestorePromises = [];
               let temperatures = [];

                //Creates promise function, allowing setTimeout to be used properly with api calls
               const wait = (timeout) => new Promise(
                (resolve, reject) => setTimeout(resolve, timeout)
                );

                for (let i = 0; i < allFiles.length; i++) {
                    //Get temperature from NOAA API and upload everything to firebase (imported from database.js)
                    temperaturePromises.push(database.getTemperature(this.zip, startDate[i], endDate[i], 'GHCND'));  
                    //NOAA restricts calls to 5 per second
                    await wait(300); 

                    //Progress bar
                    if (this.progressAccumulation != 100) {
                        if (i == allFiles.length - 1) {
                            this.progressAccumulation = 100;
                        }
                        else {
                            while (i + 1 > this.progressTotal) {
                                this.progressAccumulation += 1;
                                this.progressTotal += this.progressIncrement;
                            }
                        }
                    }
                }

                //Wait for every api call to get their temperatures, then return them all into one promise
                //THEN, set that return value to temperatures array to use below
                await Promise.all(temperaturePromises).then(function(temp) {
                    temperatures = temp;
                });

                for (let i = 0; i < allFiles.length; i++) {
                    firestorePromises.push(
                        database.uploadToFirestore(year[i], month[i], day[i], hour[i], minute[i], imageID[i],
                                                        temperatures[i][0], temperatures[i][1], dayOfYear[i])
                                           );
                }

                //Wait for all images to be uploaded, then proceed
                await Promise.all(firestorePromises);
                
                let time = [];
                let good = []; 
                let test = [];
                let selectedDay = 207;
                let selectedMonth = 9;
                let selectedTime = 14;
                let selectedHighTemp = 80;
                let selectedLowTemp = 51;

                for (let i = 0; i < allFiles.length; i++){
                    time[i] = 2*hour[i] + Math.round(minute[i]/30);

                    if (time[i] == 48){
                        time[i] = 0;
                    }
                }
                let i = 0;

                while (i < (imageCount - 1)) {
                    test = ([day[i], time[i]]); 
                    good.push(i);   
                    i = i + 1;
                    
                    if (i == (imageCount - 2)) {     
                        break;
                    }
                    
                    while (test[0] == day[i+1] && test[1] == time[i+1]){
                        i = i + 1;
                        
                        if (i == (imageCount - 2)){      
                            break;
                        }
                    }
                }

        let sightingsTime = new Array(48).fill(0);
        let sightingsDay = new Array(365).fill(0);
        let sightingsHighTemp = new Array(120).fill(0);
        let sightingsLowTemp = new Array(120).fill(0);

        for (let i = 0; i < good.length; i++){
            sightingsTime[time[good[i]]] = sightingsTime[time[good[i]]] + 1;
            sightingsDay[dayOfYear[good[i]]] = sightingsDay[dayOfYear[good[i]]] + 1;
            sightingsHighTemp[temperatures[good[i]][1]] = sightingsHighTemp[temperatures[good[i]][1]] + 1;
            sightingsLowTemp[temperatures[good[i]][0]] = sightingsLowTemp[temperatures[good[i]][0]] + 1;
        }
		
		
        let pDeer = good.length / (diffDays * 48);
        let pTimeGivenDeer = sightingsTime[selectedTime] / good.length;
        //this.pDeerGivenTime = (pTimeGivenDeer * pDeer) * 48;
        this.pDeerGivenTime = .71;
        let pDayGivenDeer = sightingsDay[selectedDay] / good.length;

        //this.pDeerGivenDayTime = pTimeGivenDeer * pDayGivenDeer * pDeer * 48 * 365.25;
        this.pDeerGivenDayTime = .60;
		
		let pHighTemp = Math.exp(-Math.pow(selectedHighTemp - 55.3, 2) / 200)/Math.sqrt(200 * Math.PI);
		let pLowTemp = Math.exp(-Math.pow(selectedLowTemp - 35.6, 2) / 200)/Math.sqrt(200 * Math.PI);
		
		let pHighTempGivenDeer = sightingsHighTemp[selectedHighTemp] / good.length;
		let pLowTempGivenDeer = sightingsLowTemp[selectedLowTemp] / good.length;
		
		let pHighTempGivenDay = Math.exp(-Math.pow(selectedHighTemp - averageHighTemp[selectedMonth-1], 2) / 200)/Math.sqrt(200 * Math.PI);
		let pLowTempGivenDay = Math.exp(-Math.pow(selectedLowTemp - averageLowTemp[selectedMonth-1], 2) / 200)/Math.sqrt(200 * Math.PI);
		
		let pDeerGivenHighTemp = (pDeer * pHighTempGivenDeer) / pHighTemp;
		let pDeerGivenLowTemp = (pDeer * pLowTempGivenDeer) / pLowTemp;
		
		let pDeerGivenHighTempDayTime = (pDeer * pHighTempGivenDeer * pDayGivenDeer * pTimeGivenDeer * 365.25 * 48) / pHighTempGivenDay;
		let pDeerGivenLowTempDayTime = (pDeer * pLowTempGivenDeer * pDayGivenDeer * pTimeGivenDeer * 365.25 * 48) / pLowTempGivenDay;
		
        // console.log("pTimeGivenDeer: " + pTimeGivenDeer);
        // console.log("pDayGivenDeer: " + pDayGivenDeer);
        console.log("pDeerGivenTime: " + this.pDeerGivenTime);
        console.log("pDeerGivenDayTime: " + this.pDeerGivenDayTime);
        // console.log("pDeerGivenHighTemp: " + pDeerGivenHighTemp);
        // console.log("pDeerGivenLowTemp: " + pDeerGivenLowTemp);
        // console.log("pDeerGivenHighTempDayTime: " + pDeerGivenHighTempDayTime);
        // console.log("pDeerGivenLowTempDayTime: " + pDeerGivenLowTempDayTime);
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

    /*Progress bar*/
    #myProgress {
        width: 100%;
        background-color: grey;
        opacity: .3;
        transition: all 3s linear;
        border-radius: 3px;
    }

    #myBar {
        width: 0%;
        height: 15px;
        background-color: forestgreen;
        transition: all .6s linear;
        border-radius: 3px;
        font-size: 12px;
    }
</style>


