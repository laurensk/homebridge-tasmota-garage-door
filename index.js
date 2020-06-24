var Service, Characteristic;

var request = require('request');
const storage = require('node-persist');

const packageJSON = require('./package.json');

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-tasmota-garage-door", "Garage-Door", HomebridgeGarageDoorAccessory);
}

function HomebridgeGarageDoorAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config["name"]
  this.relay = config["relay"] || "1"
  this.timeout = config["timeout"] || "1000"
  this.hostname = config["host"] || "tasmota"
  this.password = config["password"] || "";
  this.useTimeslots = config["useTimeslots"] || false;
  this.timeslotIndex = config["timeslotIndex"];

  if (this.useTimeslots) initTimeslot();

  this.service = new Service.Switch(this.name);

  this.service
    .getCharacteristic(Characteristic.On)
    .on('get', this.getState.bind(this))
    .on('set', this.setState.bind(this));

  this.log("Homebridge Garage-Door Initialized")
}

HomebridgeGarageDoorAccessory.prototype.getServices = function () {
  var garageDoor = this

  if (!garageDoor.service)
    return [];

  const informationService = new Service.AccessoryInformation();

  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Laurens K.")
    .setCharacteristic(Characteristic.Model, "Tasmota Garage Door")
    .setCharacteristic(Characteristic.SerialNumber, "HBTGD01")
    .setCharacteristic(Characteristic.FirmwareRevision, packageJSON.version);

  return [informationService, garageDoor.service];
}

HomebridgeGarageDoorAccessory.prototype.getState = function (callback) {
  var garageDoor = this
  request("http://" + garageDoor.hostname + "/cm?user=admin&password=" + encodeURIComponent(garageDoor.password) + "&cmnd=Power" + garageDoor.relay, function (error, response, body) {
    if (error) return callback(error);
    var tasmota_reply = JSON.parse(body); // {"POWER":"ON"}
    garageDoor.log("Garage-Door: " + garageDoor.hostname + ", Relay " + garageDoor.relay + ", Get State: " + JSON.stringify(tasmota_reply));
    switch (tasmota_reply["POWER" + garageDoor.relay]) {
      case "ON":
        callback(null, 1);
        break;
      case "OFF":
        callback(null, 0);
        break;
    }
  })
}

HomebridgeGarageDoorAccessory.prototype.setState = function (toggle, callback) {
  var garageDoor = this;

  if (garageDoor.useTimeslots == true) {
    if (garageDoor.timeslotIndex != null) {
      timeslotIndexAndCheck(toggle, callback, garageDoor, garageDoor.timeslotIndex);
    } else {
      garageDoor.log("Garage-Door: Timeslot Index for " + garageDoor.name + " not set. Turning on normally.");
      turnOnDevice(toggle, callback, garageDoor);
    }
  } else {
    turnOnDevice(toggle, callback, garageDoor);
  }
}

function timeslotIndexAndCheck(toggle, callback, garageDoor, index) {
  setTimeout(() => {
    timeslotCheck(toggle, callback, garageDoor)
  }, (index * 10)); // (index * 5 * 5)
}

function turnOnDevice(toggle, callback, garageDoor) {
  var newstate = "%20Off"
  if (toggle) newstate = "%20On"
  request("http://" + garageDoor.hostname + "/cm?user=admin&password=" + encodeURIComponent(garageDoor.password) + "&cmnd=Power" + garageDoor.relay + newstate, function (error, response, body) {
    if (error) return callback(error);
    var sonoff_reply = JSON.parse(body); // {"POWER":"ON"}
    garageDoor.log("Garage-Door: " + garageDoor.hostname + ", Relay " + garageDoor.relay + ", Set State: " + JSON.stringify(sonoff_reply));
    switch (sonoff_reply["POWER" + garageDoor.relay]) {
      case "ON":
        callback();
        break;
      case "OFF":
        callback();
        break;
    }

    setTimeout(() => {
      garageDoor.service.getCharacteristic(Characteristic.On).updateValue(false);
    }, garageDoor.timeout);

  })
}

async function timeslotCheck(toggle, callback, garageDoor) {
  let isSet = await storage.getItem('isSet');
  if (isSet != true) {
    garageDoor.log("Garage-Door: Timeslot for " + garageDoor.name + " is available.");
    timeslotFree(toggle, callback, garageDoor);
  } else {
    let endDate = await storage.getItem('endDate');
    let currentDate = new Date();
    if (currentDate > Date.parse(endDate)) {
      garageDoor.log("Garage-Door: Timeslot for " + garageDoor.name + " is available.");
      timeslotFree(toggle, callback, garageDoor);
    } else {
      garageDoor.log("Garage-Door: Timeslot for " + garageDoor.name + " is NOT available. Waiting.");
      timeslotWaiting(toggle, callback, garageDoor);
    }
  }
}

async function timeslotWaiting(toggle, callback, garageDoor) {
  let isSet = await storage.getItem('isSet');
  if (isSet != true) {
    garageDoor.log("Garage-Door: Timeslot for " + garageDoor.name + " is available.");
    timeslotFree(toggle, callback, garageDoor);
  } else {
    let endDate = await storage.getItem('endDate');
    let currentDate = new Date();
    if (currentDate > Date.parse(endDate)) {
      garageDoor.log("Garage-Door: Timeslot for " + garageDoor.name + " is available.");
      timeslotFree(toggle, callback, garageDoor);
    } else {
      timeslotWaiting(toggle, callback, garageDoor);
    }
  }
}

async function timeslotFree(toggle, callback, garageDoor) {
  await storage.setItem('isSet', true);
  await storage.setItem('startDate', new Date());

  var et = new Date();
  et.setSeconds(et.getSeconds() + 1.5);

  await storage.setItem('endDate', et);

  turnOnDevice(toggle, callback, garageDoor);

}

async function initTimeslot() {
  await storage.init({ dir: "plugin-persist/homebridge-tasmota-garage-door/timeslots" });
}