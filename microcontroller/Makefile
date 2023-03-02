.PHONY: build

BOARD=uno
PORT=/dev/ttyACM0

BOARDFQ=arduino:avr:$(BOARD)

all: upload

build:
	arduino-cli compile -b  $(BOARDFQ) .

upload: build
	arduino-cli upload -p $(PORT) -b $(BOARDFQ) .
