# homebridge-garage-door

Forked from https://github.com/ageorgios/homebridge-sonoff-tasmota-http

Text

## Example config

```json
{
  "accessory": "Garage-Door",
  "name": "Main Garage Door",
  "hostname": "Hostname of Tasmota Relay"
}
```

## Multiple Relays

```json
{
  "accessory": "Garage-Door",
  "name": "Main Garage Door",
  "relay": "2",
  "hostname": "Hostname of Tasmota Relay"
}
```

## Password specified in Web Interface

```json
{
  "accessory": "Garage-Door",
  "name": "Main Garage Door",
  "password": "The password from the web interface",
  "hostname": "Hostname of Tasmota Relay"
}
```
