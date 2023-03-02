import { BluetoothSerialPort } from "bluetooth-serial-port";
import stream from "stream";
import { Streamable } from "../Serial";

// const btToDuplex = (btClient: BluetoothSerialPort): stream.Duplex => {
// 	return new stream.Duplex({

// 	});
// }



export class BluetoothClient implements Streamable {

	private duplex: stream.Duplex;

	constructor(private readonly btClient: BluetoothSerialPort) {
		this.duplex = new stream.PassThrough()
		btClient.on('data', ((data: Buffer) => {
			this.duplex.write(data);
		}).bind(this));
	}

	pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean | undefined; } | undefined): T {
		return this.duplex.pipe(destination, options);
	}
	write(chunk: any, encoding?: BufferEncoding | undefined, cb?: ((error: Error | null | undefined) => void) | undefined): boolean;
	write(chunk: any, cb?: ((error: Error | null | undefined) => void) | undefined): boolean;
	write(chunk: unknown, encoding?: unknown, cb?: unknown): boolean {
		this.btClient.write(chunk as any, cb as any);
		return true;
	}


	// 	_read() {
	// 		return this.btClient.r
	// 	}

	// 	// Writes the data, push and set the delay/timeout
	// 	_write(chunk: Buffer, encoding: unknown, callback: (err?: Error) => void) {
	// 		this.btClient.write(chunk, callback);
	// 	}
}