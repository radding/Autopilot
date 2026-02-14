import { CommandV2 } from "../commands";
import { DeviceData } from "../messages/service_pb";
import { Empty, StreamDataRequest } from "../messages/service_pb";

export class GetDataV2 extends CommandV2<
    "DATARESULT",
    "GET_DATA",
    "setEmpty",
    "getData",
    Empty,
    DeviceData.AsObject,
    DeviceData
> {
    constructor() {
        super("GET_DATA", "DATARESULT", "setEmpty", "getData");
    }

    public createRequestBody(): Empty {
        return new Empty();
    }
    
    public body(data: DeviceData): DeviceData.AsObject {
        return data.toObject();
    }
    
}

export const Duration = {
    second(value: number) {
        return value * 1000;
    },
    minute(value: number) {
        return value * 60 * 1000;
    },
    millisecond(value: number) {
        return value;
    }
}

export class StreamDataV2 extends CommandV2<
    "DATARESULT",
    "GET_DATA",
    "setStreamdatarequest",
    "getData",
    StreamDataRequest,
    DeviceData.AsObject,
    DeviceData
> {
    constructor(private readonly refreshRate = Duration.second(1)) {
        super("GET_DATA", "DATARESULT", "setStreamdatarequest", "getData");
    }

    public createRequestBody(): StreamDataRequest {
        const req =  new StreamDataRequest();
        req.setStreamrefreshrate(this.refreshRate);
        return req;
    }
    
    public body(data: DeviceData): DeviceData.AsObject {
        return data.toObject();
    }
    
}
