import { CommandV2 } from "../commands";
import { Empty, PrintContents } from "../messages/service_pb";

export class StartTelemetryV2 extends CommandV2<"TELEMETRYRESULT", "START_TELEMETRY", "setEmpty", "getTelemetrycontents", Empty, PrintContents.AsObject, PrintContents> {
    constructor() {
        super("START_TELEMETRY", "TELEMETRYRESULT", "setEmpty", "getTelemetrycontents");
    }

    public createRequestBody(): Empty {
        return new Empty();
    }

    public body(data: PrintContents): PrintContents.AsObject {
        return data.toObject();
    }
}