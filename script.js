'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map;
let mapEvent;



if (navigator.geolocation) { //to check for older browsers
    navigator.geolocation.getCurrentPosition(function (pos) {
        const { longitude } = pos.coords;
        const { latitude } = pos.coords;

        console.log(longitude, latitude)
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`)

        const coords = [latitude, longitude]
        map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);



        map.on('click', function (mapE) {

            mapEvent = mapE;
            form.classList.remove("hidden")
            inputDistance.focus()

        })

    }, function () {
        alert("cannot get your location");
    })
}

form.addEventListener("submit", function (e) {
    e.preventDefault()
    console.log(mapEvent)

    inputDistance.value = ""
    inputCadence.value = ""
    inputDuration.value = ""
    inputElevation.value = ""

    const { lat, lng } = mapEvent.latlng
    L.marker([lat, lng]).addTo(map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup'

        }))
        .setPopupContent("Workout")
        .openPopup();
})


inputType.addEventListener("change", function(){
    inputElevation.closest(".form__row").classList.toggle('form__row--hidden')
    inputCadence.closest(".form__row").classList.toggle('form__row--hidden')
})
