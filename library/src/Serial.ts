import { DelimiterParser, ReadlineParser, SerialPort } from "serialport";
import { CommandCode } from "./commands";
import { ResponseCode } from "./responses";
import stream from "stream";

const EOL_CHAR = Buffer.from("\n").readUint8(0);

export interface ResponsePayload<T> {
	type: string;
	bytes: Uint8Array;
	toObject(): T;
}


export interface RawResponse {
	responseCode: ResponseCode;
	messageID: number;
	payload?: Uint8Array;

}

export interface CommandPayload {
	toByteArray(): Uint8Array;
}

export interface ResponseTransformer<T> {
	toResponse(raw: RawResponse): T;
}

export interface Command {
	command: CommandCode;
	payload: Uint8Array;
}

export interface StreamCommand extends Command {
	closeCommand: CommandCode;
}

export interface ISerialInterface {
	on(responseCodes: ResponseCode | ResponseCode[], cb: (resp: RawResponse) => void): void;
	send(cmd: Command, timeOutMS?: number): Promise<RawResponse>;

}

export type Streamable = Pick<stream.Duplex, "pipe" | "write">;

const GetBytesString = (arr: number[]) => {
	return arr.map(bt => `0x${Buffer.from([bt]).toString("hex")}`).join(" ")
}

export class SerialInterface implements ISerialInterface {
	private responseWaiters: Map<number, (resp: RawResponse) => void> = new Map();
	private tempResults: Map<number, RawResponse> = new Map();
	private listeners: Map<ResponseCode, Array<(rawResponse: RawResponse) => void>> = new Map();
	private parser: any;
	private streams: Map<number, stream.Writable> = new Map();

	constructor(private readonly port: Streamable) {
		/**
		 * Chunk out the raw buffer into arrays terminated by the EOL character (`\n` or 0x0A);
		 */
		const chunkinator = stream.Duplex.from(async function* generator(stream: AsyncIterable<Buffer>) {
			let realChunk: number[] = [];
			for await (const chunk of stream) {
				for (let i = 0; i < chunk.length; i++) {
					const byte = chunk.readUint8(i);
					realChunk.push(byte); // Append to the current chunk
					if (byte === EOL_CHAR) {
						/**
						* old chunk is done because we encountered the EOL char, yield it and send it down our pipeline
						* set real chunk to a new empty array to be able to accept the next serial data.
						*/
						const chunkToYield = new Uint8Array(realChunk);
						yield chunkToYield;
						realChunk = [];
					}
				}
			}
			yield new Uint8Array(realChunk); // Flush any remaining data.
		});

		/**
		 * Transform our Uint8Array into a response object. The response object contains our responseCode
		 * (a byte that corresponds to our ResponseCode enum), the messageID that it is responsible for
		 * (0x00 means general broad cast), and the payload.
		 * 
		 */
		const transformToResponse = stream.Duplex.from(async function* (stream: AsyncIterable<Uint8Array>) {
			for await (const msg of stream) {
				const responseCodeUint8: ResponseCode = msg.at(0) || ResponseCode.UNRECOGNIZED_COMMAND;
				yield {
					responseCode: responseCodeUint8,
					messageID: msg.at(1),
					payload: msg.slice(2),
				}
			}
		});

		/**
		 * Pipe our chunkinator and our transformer through our data.
		 */
		this.parser = port.pipe(chunkinator).pipe(transformToResponse);

		this.parser.on("data", ((chunk: RawResponse) => {
			if (this.responseWaiters.has(chunk.messageID)) {
				this.responseWaiters.get(chunk.messageID)!(chunk);
				this.responseWaiters.delete(chunk.messageID);
			} else if (this.streams.has(chunk.messageID)) {
				const stream = this.streams.get(chunk.messageID);
				stream!.write(chunk);
			} else if (chunk.messageID != undefined && chunk.messageID !== 0x00) {
				this.tempResults.set(chunk.messageID, chunk);
			}
			if (this.listeners.has(chunk.responseCode)) {
				this.listeners.get(chunk.responseCode)!.forEach(listener => listener(chunk));
			}
		}).bind(this));
	}

	public on(responseCodes: ResponseCode | ResponseCode[], cb: (resp: RawResponse) => void) {
		if (!Array.isArray(responseCodes)) {
			this.addListener(responseCodes, cb);
		} else {
			responseCodes.forEach(responseCode => this.addListener(responseCode, cb));
		}
	}

	private addListener(responseCode: ResponseCode, cb: (resp: RawResponse) => void) {
		let listenerArr = this.listeners.get(responseCode);
		if (listenerArr === undefined) {
			listenerArr = [];
		}
		listenerArr.push(cb);
		this.listeners.set(responseCode, listenerArr);

	}

	public send(cmd: Command, timeOutMS: number = 1000, messageId?: number): Promise<RawResponse> {
		const messageID = messageId ?? Math.floor(Math.random() * 255) + 1; // Generate a random 8 bit id;
		return new Promise<RawResponse>((res, rej) => {
			const array = new Uint8Array([cmd.command, messageID!, cmd.payload.length, ...cmd.payload, EOL_CHAR]);
			this.port.write(array, undefined, (err) => {
				setTimeout(rej, timeOutMS, new Error("timeout waiting for serial reply"))
				if (err) {
					return rej(err);
				} else if (this.tempResults.has(messageID)) {
					const response = this.tempResults.get(messageID!)!;
					res(response);
					this.tempResults.delete(messageID);
				} else {
					this.responseWaiters.set(messageID, res);
					return;
				}
			});
		});
	}

	public async stream(cmd: StreamCommand): Promise<stream.Readable> {
		const streamID = Math.floor(Math.random() * 255) + 1;

		const strm = stream.Duplex.from(async function* (data: AsyncIterable<RawResponse>) {
			for await (const chunk of data) {
				yield chunk;
			}
		});

		strm.on("close", async () => {
			await this.send({
				command: cmd.closeCommand,
				payload: new Uint8Array([streamID]),
			});
		});
		await this.send(cmd, 1000, streamID);
		this.streams.set(streamID, strm);
		return strm;
	}
}
