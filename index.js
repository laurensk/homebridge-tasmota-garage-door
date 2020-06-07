var Service, Characteristic;
var request = require('request');

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
  this.hostname = config["hostname"] || "tasmota"
  this.password = config["password"] || "";

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
  request("http://" + garageDoor.hostname + "/cm?user=admin&password=" + garageDoor.password + "&cmnd=Power" + garageDoor.relay, function (error, response, body) {
    if (error) return callback(error);
    var tasmota_reply = JSON.parse(body); // {"POWER":"ON"}
    garageDoor.log("Garage Door: " + garageDoor.hostname + ", Relay " + garageDoor.relay + ", Get State: " + JSON.stringify(tasmota_reply));
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
  var garageDoor = this
  var newstate = "%20Off"
  if (toggle) newstate = "%20On"
  request("http://" + garageDoor.hostname + "/cm?user=admin&password=" + garageDoor.password + "&cmnd=Power" + garageDoor.relay + newstate, function (error, response, body) {
    if (error) return callback(error);
    var sonoff_reply = JSON.parse(body); // {"POWER":"ON"}
    garageDoor.log("Garage Door: " + garageDoor.hostname + ", Relay " + garageDoor.relay + ", Set State: " + JSON.stringify(sonoff_reply));
    switch (sonoff_reply["POWER" + garageDoor.relay]) {
      case "ON":
        callback();
        break;
      case "OFF":
        callback();
        break;
    }

    setTimeout(() => {
      garageDoor.service.getCharacteristic();
    }, 1500);

    // setTimeout(() => {
    //   garageDoor.service.setCharacteristic(Characteristic.On, false);
    // }, 1000);

  })
}