
embedded: ./protos/service.proto
	python ./nanopb/generator/nanopb_generator.py ./protos/service.proto -I ./protos -D embedded

typescript: ./protos/service.proto
	protoc --js_out="import_style=commonjs,binary:typescript" --ts_out="typescript" ./protos/service.proto -I ./protos/
