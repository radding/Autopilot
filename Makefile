.PHONY: all microcontroller

all: install lib

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

shell: all
	node