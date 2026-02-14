import { PassThrough, pipeline, Readable, Transform } from "stream";
import { AnyCommandV2, CommandV2Return } from "./commands";
import { MessageLevel, PrintContents, RequestType, Response, ResponseType } from "./messages/service_pb";
import { Logger } from "winston";
import { ResponseStream } from "./stream";
import { StartTelemetryV2 } from "./cmdsv2/StartTelemetry";
import { Duplex } from "stream";

export interface Writer {
	write(data: Uint8Array): void;
	onMessage(cb: (data: Uint8Array) => void): void;
	disconnect(): void;
}


const asyncResolver = <T>() => {
	let resolve: (data: T) => void;
	const promise = new Promise<T>((res) => {
		resolve = res;
	});
	return {
		promise,
		resolve: resolve!,
	}
}

function createCallbackToReadableStream(writer: Writer, logger: Logger) {
  return new Readable({
    objectMode: true,
    read() {
      writer.onMessage((data: Uint8Array) => {
		const buff = Buffer.from(data);
        logger.debug("readable stream", {data: buff.toString("hex")});
        if (data) {
          this.push(data);
        }
        
      });
    }
  });
}



const getSizeDeliminatedProtoBuffer = (logger: Logger) => async function* sizeDelimitedProtoBuffer(dataStream: AsyncIterable<Uint8Array>): AsyncIterable<Uint8Array> {
	let buff = new Uint8Array();
	let written = 0;
	let size = -1;
	for await (let data of dataStream) {
		const buffT = Buffer.from(data);
		logger.debug("sizeDelimitedProtoBuffer", {data: buffT.toString("hex")});
		if (data.length > 1) {
			if (size === -1) {
				size = data[0];
				data = data.slice(1);
				buff = new Uint8Array(size);
				logger.debug("expected message of size", {size});
			}
			buff.set(data, written);
			written += data.length;
		}
		if (written >= size) {
			const buffT = Buffer.from(buff);
			logger.debug("full message", {data: buffT.toString("hex")});
			written = 0;
			size = -1;
			yield buff;
			buff = new Uint8Array();
		}
	}
}

const getBufferedDecoder = (logger: Logger) => async function* bufferedDecoder(dataStream: AsyncIterable<Uint8Array>): AsyncIterable<Response> {
	for await (const data of dataStream) {
		const response = Response.deserializeBinary(data);
		logger.debug("response buffered", {response: response.toObject()});
		yield response;
	}
}


export class Autopilot {
	private readonly messageWaiters: Map<number, (response: Response) => void> = new Map();
	private readonly streamWaiters: Map<number, Duplex> = new Map();

    constructor(private readonly writer: Writer, private readonly logger: Logger) {
		const dataStream = createCallbackToReadableStream(this.writer, this.logger);
		const sizeDelimitedProtoBuffer = getSizeDeliminatedProtoBuffer(this.logger);
		const bufferedDecoder = getBufferedDecoder(this.logger);
		const responseStream = this.responseStream.bind(this);

		pipeline(
			dataStream, 
			sizeDelimitedProtoBuffer, 
			bufferedDecoder,
			async function* (dataStream: AsyncIterable<Response>) {
				for await (const data of dataStream) {
					logger.debug("print stream", {response: data.toObject()});
					yield data;
				}
			},
			responseStream,
			async function (dataStream: AsyncIterable<boolean>) {
				logger.debug("processing", {dataStream});
			},
		).on("error", (err) => {
			this.logger.error("pipeline error", {err});
		}).on("finish", () => {
			this.logger.debug("pipeline finished");
		}).on("end", () => {
			this.logger.debug("pipeline ended");
		});
    }

	async *responseStream(dataStream: AsyncIterable<Response>): AsyncIterable<boolean> {
		this.logger.debug("responseStream");
		for await (const data of dataStream) {
			this.logger.debug("resolving", {response: data.toObject()});
			if (data.getStreamid() > 0) {
				const resolve = this.streamWaiters.get(data.getStreamid());
				if (resolve) {
					resolve.write(data);
					yield true;
				}
				else {
					this.logger.error("No resolve for stream", data.getStreamid());
					yield false;
				}
			}
			else {
				const resolve = this.messageWaiters.get(data.getMessageid());
				if (resolve) {
					resolve(data);
					yield true;
				}
				else {
					this.logger.error("No resolve for message", data.getMessageid());
					yield false;
				}
			}
		}
	}

	public async send<
		TCommand extends AnyCommandV2
	>(command: TCommand): Promise<CommandV2Return<TCommand>> {
		let messageId = Math.floor(Math.random() * 254) + 1;
		while (this.messageWaiters.has(messageId)) {
			messageId = Math.floor(Math.random() * 254) + 1;
		}
		const dataSend = command.encode(messageId, false);
		const { promise, resolve } = asyncResolver<Response>();
		this.messageWaiters.set(messageId, resolve);
		this.writer.write(dataSend);
		const response = await promise;
		this.messageWaiters.delete(messageId);
		return command.decode(response.serializeBinary());
	}

	public async stream<
		TCommand extends AnyCommandV2
	>(command: TCommand): Promise<Duplex> {
		let streamid = Math.floor(Math.random() * 254) + 1;
		while (this.streamWaiters.has(streamid)) {
			streamid = Math.floor(Math.random() * 254) + 1;
		}
		const dataSend = command.encode(streamid, true);

		const responseStream = new PassThrough({
			writableObjectMode: true,
		}).pipe(new Transform({
			objectMode: true,
			transform(chunk: Response, encoding, callback) {
				callback(null, command.decode(chunk.serializeBinary()));
			}
		}));
		this.writer.write(dataSend);
		this.streamWaiters.set(streamid, responseStream);
		// responseStream.on("data", (data: Response) => {
		// 	// const response = Response.deserializeBinary(data);
		// 	const val = command.decode(data.serializeBinary());
		// 	return val;
		// });

		return responseStream;
	
	}

	public disconnect(): void {
		this.writer.disconnect();
	}
}