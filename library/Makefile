proto: 
	@$(MAKE) -C ../ proto-ts
	copy ..\\messages\\typescript\\* .\\src\\messages\\*

install: package.json
	npm i
build: install proto
	npm run build
