.PHONY: build

BOARD=nano
PORT=/dev/ttyACM0
LOG_LEVEL='INFO|WARN|ERROR'
COMPASS_CHIP=USE_MPU9250_WE
CORRECTION_ALGO=INSTR

BOARDFQ=arduino:mbed_nano:nano33ble

all: upload

build:
	arduino-cli compile -b $(BOARDFQ) .

build-clean:
	arduino-cli compile --clean -b $(BOARDFQ) . --build-property "build.extra_flags=-DLOG_LEVEL=$(LOG_LEVEL) -D$(COMPASS_CHIP) -DUSE_$(CORRECTION_ALGO)" 


upload: build
	arduino-cli upload -p $(PORT) -b $(BOARDFQ) .

monitor: upload
	arduino-cli monitor -p $(PORT)
