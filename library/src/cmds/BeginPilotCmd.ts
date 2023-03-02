import { CommandCode } from "../commands";
import { ResponseCode } from "../responses";
import { RawResponse } from "../Serial";
import { createSimpleCmd } from "./cmdCreator";

export interface AckResponse {
	ack: boolean
}

export const AckResponse = (...errorCases: ResponseCode[]) => {
	const errorCodesSet = new Set(errorCases);
	return {
		toResponse(raw: RawResponse): AckResponse {
			if (errorCodesSet.has(raw.responseCode)) {
				throw new Error(`error: ${ResponseCode[raw.responseCode]}`);
			}
			if (raw.responseCode === ResponseCode.ACK) {
				return {
					ack: true,
				}
			}

			throw new Error(`unrecognized response code: ${raw.responseCode.toString(16)}`);
		}
	}
}

export const BeginPilotCompassCmd = createSimpleCmd(
	CommandCode.BEGIN_PILOT_COMPASS,
	AckResponse(ResponseCode.ERR_NO_DESIRED_HEADING),
);

export const EndPilotCompassCmd = createSimpleCmd(CommandCode.END_PILOT_COMPASS);