import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class ApplicationController extends Controller {
  @service
  googleMapsApi;

  get google() {
    return this.googleMapsApi.google;
  }

  london = { lat: "51.507568", lng: "-0.127762" };

  @tracked
  locations = [];

  @tracked
  originalLocations = [];

  constructor() {
    super(...arguments);

    this.generateLocations()
      .then(locations => this.originalLocations = locations);

    this.perturbLocations();
  }

  perturbLocations() {
    later(() => {
      this.locations = this.originalLocations.filter(coinToss);
      this.perturbLocations();
    }, 300)
  }

  generateLocations() {
    return this.google.then(google => {
      let { lat, lng } = this.london
      let origin = new google.maps.LatLng(lat, lng);

      return Array(42).fill().map((_e, i) => {
        let heading = randomInt(1, 360);
        let distance = randomInt(100, 5000);
        let n = google.maps.geometry.spherical.computeOffset(origin, distance, heading);
        return { id: i, lat: n.lat(), lng: n.lng() };
      });
    });
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function coinToss() {
  return Math.random() >= 0.5 ? true : false;
}
