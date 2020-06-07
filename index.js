var Service, Characteristic;
var request = require('request');

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

  this.accessoryInformation = new Service.AccessoryInformation();

  accessoryInformation
    .setCharacteristic(Characteristic.Manufacturer, "Laurens K.")
    .setCharacteristic(Characteristic.Model, "Tasmota Garage Door")
    .setCharacteristic(Characteristic.SerialNumber, "homebridge-tasmota-garage-door");

  this.service = new Service.Switch(this.name);

  this.service
    .getCharacteristic(Characteristic.On)
    .on('get', this.getState.bind(this))
    .on('set', this.setState.bind(this));

  this.log("Homebridge Garage Door Initialized")
}

HomebridgeGarageDoorAccessory.prototype.getState = function (callback) {
  request("http://" + this.hostname + "/cm?user=admin&password=" + this.password + "&cmnd=Power" + this.relay, function (error, response, body) {
    if (error) return callback(error);
    var tasmota_reply = JSON.parse(body); // {"POWER":"ON"}
    this.log("Garage Door: " + this.hostname + ", Relay " + this.relay + ", Get State: " + JSON.stringify(tasmota_reply));
    switch (tasmota_reply["POWER" + this.relay]) {
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
  var newstate = "%20Off"
  if (toggle) newstate = "%20On"
  request("http://" + this.hostname + "/cm?user=admin&password=" + this.password + "&cmnd=Power" + this.relay + newstate, function (error, response, body) {
    if (error) return callback(error);
    var sonoff_reply = JSON.parse(body); // {"POWER":"ON"}
    this.log("Garage Door: " + this.hostname + ", Relay " + this.relay + ", Set State: " + JSON.stringify(sonoff_reply));
    switch (sonoff_reply["POWER" + this.relay]) {
      case "ON":
        callback();
        break;
      case "OFF":
        callback();
        break;
    }

    setTimeout(() => {
      this.service.setCharacteristic(Characteristic.On, false);
    }, 1000);

  })
}

HomebridgeGarageDoorAccessory.prototype.getServices = function () {
  return [this.service];
}
