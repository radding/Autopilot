import { Readable } from "stream";
import { ResponseCode } from "./responses";
import { Command, ISerialInterface, RawResponse, StreamCommand } from "./Serial";

const wait = (timeInMS: number) => new Promise(res => setTimeout(res, timeInMS));

export class ExpBackoffSerial implements ISerialInterface {
    constructor(private readonly serialInterface: ISerialInterface, private readonly retries: number, private readonly backoff: number) {}

    stream(cmd: StreamCommand): Promise<Readable> {
        return this.serialInterface.stream(cmd);
    }

    on(responseCodes: ResponseCode | ResponseCode[], cb: (resp: RawResponse) => void): void {
       return this.serialInterface.on(responseCodes, cb);
    }
    async send(cmd: Command, timeOutMS: number = 1000): Promise<RawResponse> {
        for (let i = 0; i < this.retries; i++) {
            try {
                return this.serialInterface.send(cmd, timeOutMS * i);
            } catch (e) {
                const timeToWait = 100;
                console.log(`Attempt ${i} failed, waiting ${timeToWait}MS before attempting again`)
                await wait(100);
            }
        }
        throw new Error(`Unable to get a response after ${this.retries} times`);
    }

}