import { StreamableAutopilotCommand, AutopilotCommand } from "../Autopilot";
import { CommandCode } from "../commands";
import { RawResponse, ResponseTransformer } from "../Serial";
import { AckResponse } from "./BeginPilotCmd";
import { Bearing, GetBearingResponse } from "./GetBearingCmd";

export class CalibrationStreamResponse implements ResponseTransformer<Bearing> {
	toResponse(raw: RawResponse): Bearing {
        console.log("RAW RESPONSE:",
            (raw.payload as any)?.map((val: any) => val.toString("16"))
        );
		return {
			bearing: Buffer.from(raw.payload!).readUint16LE(),
		}
	}

}

export class CalibrationStream implements StreamableAutopilotCommand<Bearing> {
	startCommand: AutopilotCommand<Bearing>;
	endCommand: AutopilotCommand<AckResponse>;

	constructor() {
		this.startCommand = {
			command: CommandCode.STREAM_CALIBRATION_DATA,
			payload: new Uint8Array(),
			expectedResponse: new CalibrationStreamResponse(),
		};
		this.endCommand = {
			command: CommandCode.STOP_STREAMING_CALIBRATION_DATA,
			payload: new Uint8Array(),
			expectedResponse: AckResponse(),
		}
	}

}