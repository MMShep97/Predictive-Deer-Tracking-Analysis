var firebase = require( 'firebase/app');
require('firebase/database');
require('firebase/firestore');



// Initialize Firebase
var config = {
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

export function uploadToFirestore(year, month, day, hour, minute, imageID, lowTemp, highTemp) {
    firestore.collection('/user/1/images').doc(`${imageID}`).set({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        lowTemp: lowTemp,
        highTemp: highTemp,
    })
    .then(function() { 
        
    })
    .catch(function(error) {
        console.log("Error adding document: ", error);
    });
}

//Grabs temperature data 
export function getTemperatureAndUpload(zip, startDate, endDate, dataset, callback, args) {

    var apiKey = 'suKlQEiyzoZuQufBYvwuTWksOpgvLyhI';
    var params = `datasetid=${dataset}&datatypeid=TMIN&datatypeid=TMAX&locationid=ZIP:${zip}&startdate=${startDate}&enddate=${endDate}&limit=5&units=standard`
    var request = new XMLHttpRequest()

    console.log("params: " + params);
    console.log(zip);

    //starts request to NOAA
    request.open('GET', `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?${params}`, true)
    
    //call after open, before send... sends token to header
    request.setRequestHeader("token", apiKey);
    
    request.onload = function() {

        // Begin accessing JSON data here
        // var data = JSON.parse(this.response)
        var data = JSON.parse(this.response);
        var temperature = {};
        console.log(data);

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
            //add low and high temps to args...
            args.push(temperature[0]);
            args.push(temperature[1]);

            //apply args to callback (uploadToDatabase function)
            callback.apply(this, args);
        //error
        } else {
            console.log('fuk.')
        }
    }

    //finish
    request.send()
}


//Takes in lat & longitude, converts to FIPS code for location API and returns FIPS
export function latLong2Fips(lat, long) {
    var request = new XMLHttpRequest()

    request.open('GET', `https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${long}&format=json`, true)
                         //https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${long}&format=json
    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response)
        console.log(data);
        

        if (request.status >= 200 && request.status < 400) {
            //return county fips
            console.log(data.results[0].county_fips);
            return data.results[0].county_fips; 
        } else {
            console.log('error')
        }
    }

    request.send()

}

