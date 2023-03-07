
import { CommandCode } from "../commands";
import { ResponseCode } from "../responses";
import { EmptyResponse } from "./BeginPilotCmd";
import { CommandBuilder } from "./cmdCreator";

export const ChangeNameCommand = CommandBuilder.builder()
    .withCommandCode(CommandCode.CHANGE_NAME)
    .withPayloadSerializer((val: string) => {
        const valBuf = Buffer.from(val, "ascii");
        return new Uint8Array(valBuf);
    })
    .withExpectedResponse(EmptyResponse(ResponseCode.NAME_CHANGED))
    .build();