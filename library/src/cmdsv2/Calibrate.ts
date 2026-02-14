import { CommandV2 } from "../commands";
import { Empty } from "../messages/service_pb";

export class CalibrateV2 extends CommandV2<"CALIBRATE_FINISHED", "CALIBRATE", "setEmpty", "getEmpty", Empty, Empty, Empty> {
    constructor() {
        super("CALIBRATE", "CALIBRATE_FINISHED", "setEmpty", "getEmpty");
    }

    public createRequestBody(): Empty {
        return new Empty();
    }
}