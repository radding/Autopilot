import {CommandV2 } from "../commands";
import { AutopilotState, Empty, GetCapabilitesResponse } from "../messages/service_pb";

type CapabilitiesResponse = Omit<GetCapabilitesResponse.AsObject, "state">  & { 
    state: "STANDBY" | "PILOTING_TO_HEADING" | "PILOTING_TO_WIND" | "CALIBRATING"
}

export class CapabilitiesV2 extends CommandV2<"CAPABILITESRESULT", "GET_CAPABILITIES", "setEmpty", "getCapabilites", Empty, CapabilitiesResponse, GetCapabilitesResponse> {
    constructor() {
        super("GET_CAPABILITIES", "CAPABILITESRESULT", "setEmpty", "getCapabilites");
    }

    public createRequestBody(): Empty {
        return new Empty();
    }

    public body(data: GetCapabilitesResponse): CapabilitiesResponse {
        let state: CapabilitiesResponse["state"] = "STANDBY";
        switch (data.getState()) {
            case AutopilotState.STANDBY:
                state = "STANDBY";
                break;
            case AutopilotState.PILOTING_TO_HEADING:
                state = "PILOTING_TO_HEADING";
                break; 
            case AutopilotState.PILOTING_TO_WIND:
                state = "PILOTING_TO_WIND";
                break;
            case AutopilotState.CALIBRATING:
                state = "CALIBRATING";
                break;
            default:
                throw new Error("Invalid state");
        }
        return {
            ...data.toObject(),
            state,
        };
    }
}
