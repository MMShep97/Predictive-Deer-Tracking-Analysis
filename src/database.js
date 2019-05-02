var firebase = require( 'firebase/app');
require('firebase/database');
require('firebase/firestore');

// Initialize Firebase
var config = {
    //Yes, I kept the api key public :)
    apiKey: "AIzaSyBQlZUJK5wRvpOKFINaMWGT9jJeTLTgP78",
    authDomain: "predictive-deer-tracker.firebaseapp.com",
    databaseURL: "https://predictive-deer-tracker.firebaseio.com",
    projectId: "predictive-deer-tracker",
    storageBucket: "predictive-deer-tracker.appspot.com",
    messagingSenderId: "473245916948"
  };
firebase.initializeApp(config);

var firestore = firebase.firestore();
var database = firebase.database();
var updates = {};

export function uploadToFirebase(year, month, day, hour, minute, lowTemp, highTemp) {
    updates['/year'] = year;
    updates['/month'] = month;
    updates['/day'] = day;
    updates['/hour'] = hour;
    updates['/minute'] = minute;
    updates['/lowTemp'] = lowTemp;
    updates['/highTemp'] = highTemp; 

    return database.ref().update(updates);
}

export function uploadToFirestore(year, month, day, hour, minute, imageID, lowTemp, highTemp, dayOfYear) {
    firestore.collection('/user/1/images').doc(`${imageID}`).set({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        lowTemp: lowTemp,
        highTemp: highTemp,
        dayOfYear: dayOfYear,
    })
    .then(function() { 
        //Do something after each upload
    })
    .catch(function(error) {
        console.log("Error adding document: ", error);
    });
}

//Gets temperature from NOAA web service endpoints (using given parameters in api call)
export function getTemperature(zip, startDate, endDate, dataset) {
    return new Promise( (resolve, reject) => { 
        //Another public api key :o
        let apiKey = 'suKlQEiyzoZuQufBYvwuTWksOpgvLyhI';
        let params = `datasetid=${dataset}&datatypeid=TMIN&datatypeid=TMAX&locationid=ZIP:${zip}&startdate=${startDate}&enddate=${endDate}&limit=5&units=standard`
        let request = new XMLHttpRequest()
        let temperature = {};

        //starts request to NOAA
        request.open('GET', `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?${params}`, true)
        
        //call after open, before send... sends token to header
        request.setRequestHeader("token", apiKey);
        
        request.onload = function() {

            // Begin accessing JSON data here
            let data = JSON.parse(this.response);

            //success
            if (request.status >= 200 && request.status < 400) {
                
                //request gives no TMAX or TMIN
                if (data.results == undefined)  {
                    temperature[0] = null;
                    temperature[1] = null;
                //result returns TMAX/TMIN
                } else {
                    for (let i = 0; i < data.results.length; i++) {
                        if (data.results[i].datatype == 'TMIN') {
                            temperature[0] = data.results[i].value;
                        }
                        if (data.results[i].datatype == 'TMAX') {
                            temperature[1] = data.results[i].value;
                        }
                    }
                }
            //error
            } else {
                //If request fails, set temps to null
                console.log('error, setting TMAX & TMINs to null')
                temperature[0] = null;
                temperature[1] = null;
            }
            resolve(temperature);
        }
        //finish
        request.send()
    })
}

//Takes in lat & longitude, converts to FIPS code for location API and returns FIPS
export function latLong2Fips(lat, long) {
    var request = new XMLHttpRequest()

    request.open('GET', `https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${long}&format=json`, true)
                         //https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${long}&format=json
    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response)

        if (request.status >= 200 && request.status < 400) {
            //return county fips
            return data.results[0].county_fips; 
        } else {
            console.log('error')
        }
    }
    request.send()
}

