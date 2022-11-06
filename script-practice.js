'use strict';

class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = "running"
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace()
        this._setDescription();
    }

    calcPace() {
        console.log(this.coords, this.distance, this.duration, this.cadence)
        this.pace = this.duration / this.distance
        return this.pace
    }
}

class Cycling extends Workout {
    type = "cycling"
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed()
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
}

////////////////////////////////////////////////////////////
//Application Architecture

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {

    #map;
    #mapZoomLevel = 13
    #mapEvent;
    #workouts = [];
    constructor() {
        this._getLocalStorage();

        this._getPosition();
        form.addEventListener("submit", this._newWorkout.bind(this))
        inputType.addEventListener("change", this._toggleElevationField)
        containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));

    }

    _getPosition() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert("cannot get you location")
            })
        }
    }

    _loadMap(position) {
        console.log({ position })

        const { latitude } = position.coords;
        const { longitude } = position.coords;

        console.log(latitude, longitude)

        this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);



        this.#map.on('click', this._showForm.bind(this))

        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        });
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;


        form.classList.remove("hidden")
        inputDistance.focus()
    }

    _hideForm() {
        inputDistance.value = ""
        inputCadence.value = ""
        inputDuration.value = ""
        inputElevation.value = ""

        form.classList.add("hidden")

    }

    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle('form__row--hidden')
        inputCadence.closest(".form__row").classList.toggle('form__row--hidden')
    }

    _newWorkout(e) {
        e.preventDefault()

        //get data from form
        const type = inputType.value;
        const distance = Number(inputDistance.value);
        const duration = +inputDuration.value;
        const { lat: latitude, lng: longitude } = this.#mapEvent.latlng
        let workout;

        //if workout running, create running object
        if (type === "running") {
            const cadence = +inputCadence.value;

            //check if data is valid
            if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence) || distance < 0 || duration < 0 || cadence < 0) {
                if (true) {
                    alert("input has to be a positive number")
                }
            }

            workout = new Running([latitude, longitude], distance, duration, cadence)

        }

        // if workout cycling, create cycling object
        if (type === "cycling") {
            const elevation = +inputElevation.value;

            //check if data is valid
            if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(elevation) || distance < 0 || duration < 0) {
                alert("input has to be a positive number")
            }

            workout = new Cycling([latitude, longitude], distance, duration, elevation)
        }



        //add new object to workout array
        this.#workouts.push(workout);
      

        //render workout on map as marker
        this._renderWorkoutMarker(workout)

        //render workout on list

        this._renderWorkout(workout)

        //hide and clear input fields
        this._hideForm()


        //set local storage
        this._setLocalStorage();
        
    }

    _renderWorkoutMarker(workout) {
        let a;
        if (workout.speed) {
            a = 'running';
        }
        if (workout.pace) {
            a = 'cycling';
        }
       
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${a}-popup`,
            }
            )).setPopupContent(`${workout.distance}`)
            .openPopup()
    }

    _renderWorkout(workout) {

        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? "🏃‍♂️" : "🚴‍♀️"} </span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`


        if (workout.type === 'running') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
        }


        if (workout.type === 'cycling') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`

        }

        console.log("here")
        form.insertAdjacentHTML("afterend", html)
    }
    _moveToPopup(e) {
        const workoutEl = e.target.closest(".workout")
        console.log(workoutEl)

        if (!workoutEl) return;

        const workout = this.#workouts.find(
            work => work.id === workoutEl.dataset.id
        );

        console.log(workout)
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
      }
    
      _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));
    
        if (!data) return;
    
        this.#workouts = data;
    
        this.#workouts.forEach(work => {
          this._renderWorkout(work);
        });
      }
    
      reset() {
        localStorage.removeItem('workouts');
        location.reload();
      }
}



const app = new App();


