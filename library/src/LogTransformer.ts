import { ResponseCode } from "./responses";
import { RawResponse, ResponsePayload, ResponseTransformer } from "./Serial"

export type LogLevel = "info" | "error" | "warn" | "trace" | "fatal";

export const ResponseCodeToLogLevel: Record<number, LogLevel> = {
	[ResponseCode.LOG_ERROR]: "error",
	[ResponseCode.LOG_INFO]: "info",
	[ResponseCode.LOG_TRACE]: "trace",
	[ResponseCode.LOG_WARN]: "warn",
	[ResponseCode.FATAL]: "fatal",
}


export class LoggerTransformer implements ResponseTransformer<{ level: LogLevel, msg: string }> {
	public type: string = "LoggerType";

	constructor() {
	}

	toResponse(raw: RawResponse): { level: LogLevel; msg: string; } {
		return {
			level: ResponseCodeToLogLevel[raw.responseCode] ?? "warn",
			msg: new TextDecoder("ascii").decode(raw.payload),
		}
	}
}