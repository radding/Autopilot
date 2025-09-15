import { PassThrough, Readable, Transform } from "stream";
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

// class Stream extends Duplex {
// 	writableObjectMode: boolean = true;
// 	constructor() {
// 		super();
// 		this.writableObjectMode = true;
// 	}
// }


export class Autopilot {
	private readonly messageWaiters: Map<number, (response: Response) => void> = new Map();
	private readonly streamWaiters: Map<number, Duplex> = new Map();

    constructor(private readonly writer: Writer, private readonly logger: Logger) {
		let size = -1;
		let buff: Uint8Array = new Uint8Array();
		let written = 0;
		this.writer.onMessage((data) => {
			const buffT = Buffer.from(data);
			this.logger.debug("onMessage", {data: buffT.toString("hex")});
			if (size === -1) {
				size = data[0];
				data = data.slice(1);
				buff = new Uint8Array(size);
				this.logger.debug("expected message of size", {size});
			}
			if (data.length > 1) {
				buff.set(data, written);
				written += data.length;
			}
			if (written === size) {
				const buffT = Buffer.from(buff);
				this.logger.debug("full message", {data: buffT.toString("hex")});
				const response = Response.deserializeBinary(buff);
				if (response.getStreamid() > 0) {
					this.logger.debug(`stream: ${JSON.stringify(response.toObject())}`, {service: "autopilot", streamid: response.getStreamid()});
					const resolve = this.streamWaiters.get(response.getStreamid());
					if (resolve) {
						resolve.write(response);
					}
					else {
						this.logger.error("No resolve for stream", response.getStreamid());
					}
					return;
				}
				this.logger.debug(`message: ${JSON.stringify(response.toObject())}`, {service: "autopilot", messageid: response.getMessageid()});
				const resolve = this.messageWaiters.get(response.getMessageid());
				if (resolve) {
					resolve(response);
				} else {
					this.logger.error("No resolve for message", response.getMessageid());
				}
				size = -1;
				written = 0;
				buff = new Uint8Array();
			}
		});

		// this.stream(new StartTelemetryV2()).then((stream) => {
		// 	stream.on("data", (data: PrintContents.AsObject) => {
		// 		if (data.lvl === MessageLevel.INFO) {
		// 			this.logger.info(data.message, {service: "autopilot"});
		// 		} else if (data.lvl === MessageLevel.WARN) {
		// 			this.logger.warn(data.message, {service: "autopilot"});
		// 		} else if (data.lvl === MessageLevel.ERROR) {
		// 			this.logger.error(data.message, {service: "autopilot"});
		// 		} else if (data.lvl === MessageLevel.DEBUG) {
		// 			this.logger.debug(data.message, {service: "autopilot"});
		// 		} else if (data.lvl === MessageLevel.TRACE) {
		// 			this.logger.debug(data.message, {service: "autopilot"});
		// 		}
		// 		this.logger.silly("metrics", {service: "autopilot", freeMemory: data.freememory});
		// 	}).on("end", () => {
		// 		console.log("telemetry end");
		// 	});
		// });
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