.PHONY: all microcontroller

all: arduino-ble-upload lib

arduino-ble:
	@$(MAKE) -C ArduinoV2 build

arduino-ble-upload:
	@$(MAKE) -C ArduinoV2 upload 

arduino-ble-monitor:
	@$(MAKE) -C ArduinoV2 monitor 

microcontroller:
	@$(MAKE) -C microcontroller build

microcontroller-clean:
	@$(MAKE) -C microcontroller build-clean

install: microcontroller
	@$(MAKE) -C microcontroller upload

android:
	@$(MAKE) -C AutopilotApp run-android

lib:
	@$(MAKE) -C library build

shell: all shell-only

shell-only: lib
	node library/dist/shell/index.js

proto-embedded:
	@$(MAKE) -C messages embedded

proto-ts:
	@$(MAKE) -C messages typescript 

protos: proto-embedded proto-ts