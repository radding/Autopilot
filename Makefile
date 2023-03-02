.PHONY: all microcontroller

microcontroller:
	@$(MAKE) -C microcontroller build

install: microcontroller
	@$(MAKE) -C microcontroller upload

lib:
	@$(MAKE) -C library build

all: lib install