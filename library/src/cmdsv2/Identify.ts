import {  CommandV2 } from "../commands";
import { Empty, IdentifyResponse } from "../messages/service_pb";

interface IdentifyResponseRaw {
	name: string;
	version: string;
	serialNumber: string;
	firmwareVersion: string;
}

export class IdentifyV2 extends CommandV2<
    "IDENTIFYRESULT",
    "IDENTIFY",
    "setEmpty",
    "getIdentify",
    Empty,
    IdentifyResponseRaw,
    IdentifyResponse
> {
    constructor() {
        super("IDENTIFY", "IDENTIFYRESULT", "setEmpty", "getIdentify");
    }

    public createRequestBody(): Empty {
        return new Empty();
    }
    
    public body(data: IdentifyResponse): IdentifyResponseRaw {
        return {
            name: data.getName(),
            version: data.getVersion(),
            serialNumber: data.getSerialnumber(),
            firmwareVersion: data.getFirmwareversion()
        }
    }
}