import { AutopilotCommand } from "../Autopilot";
import { CommandCode } from "../commands";
import { Command, RawResponse, ResponseTransformer } from "../Serial";

export interface Bearing {
	bearing: number;
}

export class GetBearingResponse implements ResponseTransformer<Bearing> {
	toResponse(raw: RawResponse): Bearing {
		return {
			bearing: Buffer.from(raw.payload!).readUint16LE(),
		}
	}

}

export class GetBearingCommand implements AutopilotCommand<Bearing> {
	public command: CommandCode;
	public payload: Uint8Array = new Uint8Array();
	public expectedResponse: ResponseTransformer<Bearing>;

	constructor() {
		this.command = CommandCode.GET_BEARING;
		this.expectedResponse = new GetBearingResponse();
	}
}