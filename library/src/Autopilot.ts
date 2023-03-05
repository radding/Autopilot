import { SerialPort } from "serialport";
import { CommandCode } from "./commands";
import { Logger } from "./logger";
import { LoggerTransformer } from "./LogTransformer";
import { ResponseCode } from "./responses";
import { ISerialInterface, RawResponse, ResponseTransformer, SerialInterface } from "./Serial";
import stream from "stream";
import { AckResponse } from "./cmds/BeginPilotCmd";
import { PingResponse } from "./cmds/PingCmd";

export interface AutopilotCommand<T> {
	command: CommandCode;
	payload: Uint8Array;
	expectedResponse: ResponseTransformer<T>
}

export interface StreamableAutopilotCommand<T> {
	startCommand: AutopilotCommand<T>;
	endCommand: AutopilotCommand<AckResponse>;
}


interface AutopilotClientProperties {
	serialConfig?: {
		port?: string; // The Port or path to the USB device
		serialPort?: stream.Duplex; // The Duplex Stream that supports the underlying communication.
		serialInterface?: ISerialInterface; // The actual serial interface that manages the stream
		baud?: number // The baud rate for the communication defaults to 9600
	},
	logger?: Logger; // Optional logger. defaults to the standard console
	disableHeartbeat?: boolean; // Disable the heartbeat. The heartbeat is basically a way for the client to be able to tell if the device is responsive
}

export class AutopilotClient {
	private serial: ISerialInterface;
	private isReady: boolean = false;
	private missedHeartBeats = 0;
	private logger: Logger;

	constructor(config?: AutopilotClientProperties) {
		if (config?.serialConfig?.serialInterface) {
			this.serial = config.serialConfig.serialInterface;
		} else if (config?.serialConfig?.serialPort) {
			this.serial = new SerialInterface(config.serialConfig.serialPort);
		} else if (config?.serialConfig?.port) {
			this.serial = new SerialInterface(new SerialPort({
				path: config!.serialConfig!.port!,
				baudRate: config.serialConfig.baud ?? 9600,
			}));
		} else {
			throw new Error("Can't construct new serial interface");
		}
		const logger = config?.logger ?? console;
		this.logger = logger;
		const logTransformer = new LoggerTransformer();
		this.serial.on([ResponseCode.LOG_ERROR, ResponseCode.LOG_INFO, ResponseCode.LOG_TRACE, ResponseCode.LOG_WARN, ResponseCode.FATAL], (rawResp: RawResponse) => {
			const logResponse = logTransformer.toResponse(rawResp);
			const lvl = logResponse.level !== "fatal" ? logResponse.level : "error";
			if (logger[lvl]) {
				logger[lvl](logResponse.msg);
			} else {
				console.error(`can't find logger that supports ${lvl}`);
			}
		});

		this.serial.on(ResponseCode.MODULE_READY, () => {
			logger.trace("Module is ready!");
			this.isReady = true;
		});
		
		this.testConnectivity(300).then(isConnected => this.isReady = true);

		if (!config.disableHeartbeat) {
			setTimeout(this.beginHeartbeat.bind(this), 500, 100);
		}
	}

	/**
	 * get deviceUnresponsive
	 */
	public get deviceUnresponsive(): boolean {
		return this.missedHeartBeats === 3;
	}

	public async send<T>(cmd: AutopilotCommand<T>, timeOutMS: number = 1000): Promise<T> {
		return this._send(cmd, timeOutMS, false);
	}

	private async _send<T>(cmd: AutopilotCommand<T>, timeOutMS: number = 1000, skipReadyCheck: boolean = false): Promise<T> {
		if (this.deviceUnresponsive) {
			throw new Error("device is unresponsive!");
		}
		if (!this.isReady && !skipReadyCheck) {
			throw new Error("device is not ready!");

		}
		const rawResponse = await this.serial.send(cmd, timeOutMS);
		if (rawResponse.responseCode === ResponseCode.UNRECOGNIZED_COMMAND) {
			throw new Error(`Unrecognized command: ${CommandCode[cmd.command]}`);
		}
		return cmd.expectedResponse.toResponse(rawResponse);
	}

	public async stream<T>(cmd: StreamableAutopilotCommand<T>): Promise<AsyncIterable<T>> {
		const strm = await this.serial.stream({
			...cmd.startCommand,
			closeCommand: cmd.endCommand.command,
		});

		const transformer = stream.Duplex.from(async function* (resp: AsyncIterable<RawResponse>) {
			for await (const raw of resp) {
				yield cmd.startCommand.expectedResponse.toResponse(raw);
			}
		});
		return strm.pipe(transformer);
	}

	private async beginHeartbeat(timeMS: number) {
		try {
			await this._send(new PingResponse(), timeMS, true);
			this.missedHeartBeats = 0;
			this.isReady = true;
		} catch (e) {
			this.logger.warn(`error getting heartbeat: ${e}`);
			this.missedHeartBeats++;
			if (this.deviceUnresponsive) {
				return;
			}
		}
		setTimeout(() => {
			this.beginHeartbeat(timeMS);
		}, timeMS);
	}
	
	public async testConnectivity(initialTimeout: number, maxAttempts: number = 4, attemptNumber: number = 0): Promise<boolean>{
		if (maxAttempts === attemptNumber) {
			return false;
		}
		try {
			const resp = await this._send(new PingResponse(), initialTimeout);
			return resp.ack;
		} catch(e) {
			this.logger.error(`caught: ${e}`);
			return this.testConnectivity(initialTimeout + Math.round(Math.pow(1.3, attemptNumber)), maxAttempts, attemptNumber + 1);
		}
	}
}
