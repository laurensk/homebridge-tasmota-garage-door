# Homebridge Tasmota Garage Door

## Introduction
Welcome to the Homebridge Tasmota Garage Door Plugin for [Homebridge](https://github.com/homebridge/homebridge).

This plugin allows you to open and close your garage doors with Tasmota Relays using HomeKit and Siri.

## Configuration
Please follow [my tutorial](https://github.com/LaurensKDev/homebridge-garage-door-instructions) on how to flash and configure Tasmota to use it with this plugin.

When your Tasmota Relays are ready and configured correctly, add the following code to the accessories array in the Homebridge config file to get started.

### Single Relay

```json
{
  "accessory": "Garage-Door",
  "name": "Car",
  "host": "Hostname or IP of Tasmota Relay"
}
```

### Multiple Relays

```json
{
  "accessory": "Garage-Door",
  "name": "Car",
  "host": "Hostname or IP of Tasmota Relay",
  "relay": "2"
}
```

### Password specified in Web Interface

```json
{
  "accessory": "Garage-Door",
  "name": "Car",
  "host": "Hostname or IP of Tasmota Relay",
  "relay": "2",
  "password": "Password of the Web-Interface"
}
```

## Timeslots
You can use Timeslots to prevent simultaneous requests to the relays. Since most remote controls for garage doors doesn't support simultaneous button presses, you can't use them in HomeKit Scenes without further configuration. By using Timeslots in version 2.0.0 and newer, you can enable a smart, unmeasurable delay between requests easily and without further knowledge.

```json
{
  "accessory": "Garage-Door",
  "name": "Car",
  "host": "Hostname or IP of Tasmota Relay",
  "relay": "1",
  "password": "Password of the Web-Interface",
  "useTimeslots": true,
  "timeslotIndex": 1
},
{
  "accessory": "Garage-Door",
  "name": "Car",
  "host": "Hostname or IP of Tasmota Relay",
  "relay": "2",
  "password": "Password of the Web-Interface",
  "useTimeslots": true,
  "timeslotIndex": 2
}
```

Please take a closer look at the 'timeslotIndex' property and make sure it's an increasing number starting at 1 for all your garage doors (1, 2, 3, 4, ...).
This property is used to create an unmeasurable delay between single requests in order to prevent simultaneous calls to the Homebridge.

Note that the Timeslots feature won't work if you don't provide the 'timeslotIndex' property for every garage door which has 'useTimeslots' enabled.

## Thanks
Thanks to [ageorgios/homebridge-sonoff-tasmota-http](https://github.com/ageorgios/homebridge-sonoff-tasmota-http) for some inspiration.