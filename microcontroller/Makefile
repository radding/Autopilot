.PHONY: build

BOARD=uno
PORT=/dev/ttyACM0
LOG_LEVEL='INFO|WARN|ERROR'

BOARDFQ=arduino:avr:$(BOARD)

all: upload

build:
	arduino-cli compile -b  $(BOARDFQ) . --build-property "build.extra_flags=-DLOG_LEVEL=$(LOG_LEVEL)" 

upload: build
	arduino-cli upload -p $(PORT) -b $(BOARDFQ) .
