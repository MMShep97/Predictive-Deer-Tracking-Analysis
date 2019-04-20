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

export function uploadToDatabase(year, month, day, hour, minute) {
    updates['/year'] = year;
    updates['/month'] = month;
    updates['/day'] = day;
    updates['/hour'] = hour;
    updates['/minute'] = minute;

    return database.ref().update(updates);
}



//Takes in lat & longitude, converts to FIPS code for location API and returns FIPS
export function latLong2Fips(lat, long) {
    var request = new XMLHttpRequest()

    request.open('GET', `https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${long}&format=json`, true)
    request.onload = function() {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response)
        console.log(data);
        

        if (request.status >= 200 && request.status < 400) {
            //return county fips
            return data.results[0].county_fips; 
        } else {
            console.log('error')
        }
    }

    request.send()

}

//Grabs temperature data 
export function getTemperature() {
    
}