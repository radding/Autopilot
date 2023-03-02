import { AutopilotCommand } from "../Autopilot";
import { CommandCode } from "../commands";
import { ResponseCode } from "../responses";
import { ResponseTransformer } from "../Serial";
import { AckResponse } from "./BeginPilotCmd";

export class SetDesiredBearingCmd implements AutopilotCommand<AckResponse> {
	public command: CommandCode;
	public payload: Uint8Array = new Uint8Array();
	public expectedResponse: ResponseTransformer<AckResponse>;

	constructor(public readonly desiredHeading: number) {
		if (this.desiredHeading >= 360) {
			this.desiredHeading = this.desiredHeading % 360;
		}
		if (this.desiredHeading < 0) {
			throw new Error(`desired heading must be greater than 0 is ${this.desiredHeading}`);

		}
		this.command = CommandCode.SET_DESIRED_BEARING;
		this.expectedResponse = AckResponse(ResponseCode.ERR_NO_DESIRED_HEADING);
		const byte1 = (this.desiredHeading >> 8) & 0xff;
		const byte2 = (this.desiredHeading) & 0xff;
		this.payload = new Uint8Array([byte1, byte2]);
		console.log("about to send:", this.payload);
	}
}