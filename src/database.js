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