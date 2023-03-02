import { AutopilotClient, AutopilotCommand } from "../Autopilot";
import { CommandCode } from "../commands";
import { ResponseTransformer } from "../Serial";
import { AckResponse } from "./BeginPilotCmd";

export const createSimpleCmd = <T = AckResponse>(commandCode: CommandCode, r?: ResponseTransformer<T>) => {
	return class implements AutopilotCommand<T> {
		command: CommandCode;
		payload: Uint8Array;
		expectedResponse: ResponseTransformer<T>;

		constructor() {
			this.command = commandCode;
			this.payload = new Uint8Array();
			this.expectedResponse = r ?? (AckResponse() as any);
		}

	}
}