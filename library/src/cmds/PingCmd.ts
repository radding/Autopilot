import { AutopilotCommand } from "../Autopilot";
import { CommandCode } from "../commands";
import { ResponseCode } from "../responses";
import { Command, RawResponse, ResponseTransformer } from "../Serial";
import { AckResponse } from "./BeginPilotCmd";

export class PongResponse implements ResponseTransformer<AckResponse> {
	toResponse(raw: RawResponse): AckResponse {
		// if (raw.responseCode !== ResponseCode.PONG) {
		// 	throw new Error(`Unexpected response code: ${raw.responseCode}`)
		// }
		return {
			ack: true,
		}
	}

}

export class PingResponse implements AutopilotCommand<AckResponse> {
	public command: CommandCode;
	public payload: Uint8Array = new Uint8Array();
	public expectedResponse: ResponseTransformer<AckResponse>;

	constructor() {
		this.command = CommandCode.PING;
		this.expectedResponse = new PongResponse();
	}
}