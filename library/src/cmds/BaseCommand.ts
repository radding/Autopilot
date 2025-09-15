import {
  Empty,
  MessageLevel,
  RequestType,
  RequestTypeMap,
  Response,
  ResponseType,
  ResponseTypeMap,
} from '../messages/service_pb';

export interface Serializable {
  serialize(): Uint8Array;
}

export interface SerializableConstuctor<T> {
  new (props: T): Serializable;
}

// export interface Object<T> {}

export class BaseCommand<
  TArgs,
  TInput extends SerializableConstuctor<TArgs>,
  TOutputKey extends keyof Response
> {
  // @ts-expect-error bc I want it
  public Input: TInput = null;
  // @ts-expect-error bc I want it
  public Output: TOutputKey;
  public responseType: ResponseTypeMap[keyof ResponseTypeMap] =
    ResponseType.PONG;
  public requestType?: RequestTypeMap;
  public intance: Serializable;

  public constructor(args: TArgs) {
    this.intance = new this.Input!(args);
  }

  public serialize(): Uint8Array {
    return this.intance.serialize();
  }

  public deserialize(res: Response): Response[TOutputKey] {
    if (res.getType() === this.responseType) {
      return res[this.Output!];
    } else if (
      res.getType() === ResponseType.PRINT &&
      res.getTelemetrycontents()?.getLvl() === MessageLevel.ERROR
    ) {
      throw new Error(res.getTelemetrycontents()?.getMessage());
    } else {
      throw new Error(
        `unrecognized response ${res.getType()}: ${JSON.stringify(
          res.toObject
        )}`
      );
    }
  }
}

export function wireUp<TIn, TOutKey extends keyof Response>(
  serializableClass: SerializableConstuctor<TIn>,
  requestType: RequestTypeMap,
  responseType: ResponseType,
  key: TOutKey
) {
  return class extends BaseCommand<TIn, SerializableConstuctor<TIn>, TOutKey> {
    public Input: SerializableConstuctor<TIn> = serializableClass;
    public Output: TOutKey = key;
    // @ts-expect-error bc IDC
    public responseType: ResponseType = responseType;
    // @ts-expect-error bc IDC
    public requestType: RequestType = requestType;
  };
}
