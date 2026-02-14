// export enum CommandCode {
//     READ_HEADING = 1,
//     HEAD_TO_HEADING,
//     CALIBRATE,
//     CALIBRATE_END,
//     CHANGE_NAME,
//     GET_CAPABILITIES,
//     SET_PIN,
//     SET_WIND_ANGLE,
//     GET_WIND_ANGLE,
//     GET_DATA,
//     STREAM_DATA,
//     STOP_STREAM,
//     SECRET_VALUE,
//     TOGGLE_PILOT,
//     REPORT_FREE_MEMORY,
//     PING,
//     PRINT,

import { Request, RequestType, Response, ResponseType } from "./messages/service_pb";

// 	_last,
// };


export type AnyCommandV2 = CommandV2<any, any, any, any, any, any, any>;

export type CommandV2Return<T extends AnyCommandV2> = T extends CommandV2<any, any, any, any, any, infer TResponseBody, any> ? TResponseBody : never;

export abstract class CommandV2<
    ResponseType extends keyof typeof ResponseType, 
    RequestType extends keyof typeof RequestType, 
    TBodyMethod extends keyof Request, 
    TResponseMethod extends keyof Response,
    // TResponse extends Message,
    TBody extends Parameters<Request[TBodyMethod]>[0],
    TResponseBody,
    TRawResponseShape extends ReturnType<Response[TResponseMethod]>
> {

    
    constructor(
        public readonly requestType: RequestType, 
        public readonly responseType: ResponseType, 
        public readonly bodyMethod: TBodyMethod,
        public readonly responseMethod: TResponseMethod
    ) {
    }

    public encode(id: number, isStream: boolean): Uint8Array {
        const request = new Request();
        request.setType(RequestType[this.requestType]);
        request.setMessageid(isStream ? 0 : id);
        request.setStreamid(isStream ? id : 0);
        (request[this.bodyMethod] as any)(this.createRequestBody());
        return request.serializeBinary();
    }

	public abstract createRequestBody(): TBody;
	public decode(data: Uint8Array): TResponseBody {
        const response = Response.deserializeBinary(data);
        if (response.getType() !== ResponseType[this.responseType]) {
            throw new Error(`Invalid response type: ${response.getType()} expected ${ResponseType[this.responseType]}`);
        }
        const responseBody = (response[this.responseMethod] as any)();
        if (!responseBody) {
            throw new Error("No response body");
        }
        return this.body(responseBody);
    }

    protected body(data: TRawResponseShape): TResponseBody {
        return data as unknown as TResponseBody;
    }
}
