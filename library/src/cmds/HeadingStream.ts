import { AutopilotCommand, StreamableAutopilotCommand } from "../Autopilot";
import { CommandCode } from "../commands";
import { AckResponse } from "./BeginPilotCmd";
import { Bearing, GetBearingResponse } from "./GetBearingCmd";

export class HeadingStream implements StreamableAutopilotCommand<Bearing> {
	startCommand: AutopilotCommand<Bearing>;
	endCommand: AutopilotCommand<AckResponse>;

	constructor() {
		this.startCommand = {
			command: CommandCode.CONTINUOS_GET_HEADING,
			payload: new Uint8Array(),
			expectedResponse: new GetBearingResponse(),
		};
		this.endCommand = {
			command: CommandCode.STOP_SENDING_HEADING,
			payload: new Uint8Array(),
			expectedResponse: AckResponse(),
		}
	}

}