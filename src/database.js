var firebase = require( 'firebase/app');
require( 'firebase/database');


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

var updates = {};
var database = firebase.database();

export function uploadToDatabase(year, month, day, hour, minute, temperature) {
    updates['/year'] = year;
    updates['/month'] = month;
    updates['/day'] = day;
    updates['/hour'] = hour;
    updates['/minute'] = minute;
    updates['/temperature'] = temperature

    return database.ref().update(updates);
}



//Takes in lat & longitude, converts to FIPS code for location API and returns FIPS
export function latLong2Fips(lat, long) {
    var request = new XMLHttpRequest()

    request.open('GET', `https://geo.fcc.gov/api/census/area?lat=43.2694&lon=-91.4757&format=json`, true)
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

//Grabs temperature data 
export function getTemperature(FIPS, startDate, endDate, dataset) {

    var apiKey = 'suKlQEiyzoZuQufBYvwuTWksOpgvLyhI';
    var params = `datasetid=${dataset}&datatypeid=TMAX&TMIN&locationid=ZIP:52240&startdate=${startDate}&enddate=${endDate}&limit=5&units=standard`
    var request = new XMLHttpRequest()

    request.open('GET', `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?${params}`, true)
    
    //call after open, before send
    request.setRequestHeader("token", apiKey);
    
    request.onload = function() {

        // Begin accessing JSON data here
        // var data = JSON.parse(this.response)
        var data = this.response;
        console.log(data);
        data = JSON.parse(data);
        console.log(data);

        if (request.status >= 200 && request.status < 400) {
            //return county fips
            console.log("nice");
        } else {
            console.log('error')
        }
    }

    request.send()
}