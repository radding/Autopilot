import { CommandV2 } from "../commands";
import { ChangeName, Empty } from "../messages/service_pb";

export class ChangeNameV2 extends CommandV2<
    "PONG", 
    "CHANGE_NAME", 
    "setNamechange", 
    "getEmpty", 
    ChangeName, 
    Empty, 
    Empty
> {
    constructor(private readonly name: string) {
        super("CHANGE_NAME", "PONG", "setNamechange", "getEmpty");
    }

    public createRequestBody(): ChangeName {
        const changeName = new ChangeName();
        changeName.setName(this.name);
        return changeName;
    }
}