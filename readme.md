# Autopilot software for Arduino UNO/Nano

## Introduction

This is an OpenSource Autopilot implementation using an Arduino for a brain. This autopilot is a
pretty dumb autopilot that pilots to a given heading. It does not take into consideration wind angle
or GPS coordinate.

## Project setup

Right now, this project has two sub-projects: library, and micro-controller.

Library is a Typescript library that speaks to the micro-controller over serial. You can pull this
into your application and write your own interface into the micro-controller.

Micro-controller is the code that actually installs to the arduino.

### Prerequisites

In order to run this application, you need to install the arduino cli:
[https://github.com/arduino/arduino-cli](https://github.com/arduino/arduino-cli).
`Gnu Make` is also necessary.

### Uploading to a board

1. Plugin your board to your computer.
2. Run `arduino-cli board list` to find which USB port the board is installed to
3. Run `make install PORT=${usb-port from above}`

### Interfacing with a board

See [Library readme](./library/readme) for instructions

## Whats Next?

Please note that this library is not ready! Here are the things I need to do to get it there
(PRs welcome ;))

1. Bluetooth setup is not working
2. Enabling calibration of the compass
3. Test on an actual boat
4. Documentation is sparce
5. Document my Schematic
6. PCB setup
