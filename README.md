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
  "hostname": "Hostname or IP of Tasmota Relay"
}
```

### Multiple Relays

```json
{
  "accessory": "Garage-Door",
  "name": "Car",
  "relay": "2",
  "hostname": "Hostname or IP of Tasmota Relay"
}
```

### Password specified in Web Interface

```json
{
  "accessory": "Garage-Door",
  "name": "Car",
  "relay": "2",
  "password": "Password of the Web-Interface",
  "hostname": "Hostname or IP of Tasmota Relay"
}
```

## Thanks
Thanks to [ageorgios/homebridge-sonoff-tasmota-http](https://github.com/ageorgios/homebridge-sonoff-tasmota-http) for some inspiration.