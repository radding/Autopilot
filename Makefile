.PHONY: all microcontroller

all: install lib

microcontroller:
	@$(MAKE) -C microcontroller build

install: microcontroller
	@$(MAKE) -C microcontroller upload

lib:
	@$(MAKE) -C library build

shell: all
	node