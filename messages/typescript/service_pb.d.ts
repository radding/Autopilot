// package: 
// file: service.proto

import * as jspb from "google-protobuf";

export class CourseHeading extends jspb.Message {
  hasCourseoverground(): boolean;
  clearCourseoverground(): void;
  getCourseoverground(): number;
  setCourseoverground(value: number): void;

  hasMagneticcourse(): boolean;
  clearMagneticcourse(): void;
  getMagneticcourse(): number;
  setMagneticcourse(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CourseHeading.AsObject;
  static toObject(includeInstance: boolean, msg: CourseHeading): CourseHeading.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CourseHeading, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CourseHeading;
  static deserializeBinaryFromReader(message: CourseHeading, reader: jspb.BinaryReader): CourseHeading;
}

export namespace CourseHeading {
  export type AsObject = {
    courseoverground: number,
    magneticcourse: number,
  }
}

export class HeadToHeadingRequest extends jspb.Message {
  getHeading(): number;
  setHeading(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HeadToHeadingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: HeadToHeadingRequest): HeadToHeadingRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HeadToHeadingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HeadToHeadingRequest;
  static deserializeBinaryFromReader(message: HeadToHeadingRequest, reader: jspb.BinaryReader): HeadToHeadingRequest;
}

export namespace HeadToHeadingRequest {
  export type AsObject = {
    heading: number,
  }
}

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

export class ChangeName extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChangeName.AsObject;
  static toObject(includeInstance: boolean, msg: ChangeName): ChangeName.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChangeName, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChangeName;
  static deserializeBinaryFromReader(message: ChangeName, reader: jspb.BinaryReader): ChangeName;
}

export namespace ChangeName {
  export type AsObject = {
    name: string,
  }
}

export class GetCapabilitesResponse extends jspb.Message {
  getWind(): boolean;
  setWind(value: boolean): void;

  getMagnetic(): boolean;
  setMagnetic(value: boolean): void;

  getGps(): boolean;
  setGps(value: boolean): void;

  getFreememory(): number;
  setFreememory(value: number): void;

  getState(): AutopilotStateMap[keyof AutopilotStateMap];
  setState(value: AutopilotStateMap[keyof AutopilotStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCapabilitesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetCapabilitesResponse): GetCapabilitesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetCapabilitesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCapabilitesResponse;
  static deserializeBinaryFromReader(message: GetCapabilitesResponse, reader: jspb.BinaryReader): GetCapabilitesResponse;
}

export namespace GetCapabilitesResponse {
  export type AsObject = {
    wind: boolean,
    magnetic: boolean,
    gps: boolean,
    freememory: number,
    state: AutopilotStateMap[keyof AutopilotStateMap],
  }
}

export class WindAngle extends jspb.Message {
  getWindangle(): number;
  setWindangle(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WindAngle.AsObject;
  static toObject(includeInstance: boolean, msg: WindAngle): WindAngle.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WindAngle, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WindAngle;
  static deserializeBinaryFromReader(message: WindAngle, reader: jspb.BinaryReader): WindAngle;
}

export namespace WindAngle {
  export type AsObject = {
    windangle: number,
  }
}

export class DeviceData extends jspb.Message {
  hasLatitude(): boolean;
  clearLatitude(): void;
  getLatitude(): number;
  setLatitude(value: number): void;

  hasLongitude(): boolean;
  clearLongitude(): void;
  getLongitude(): number;
  setLongitude(value: number): void;

  hasSpeedoverground(): boolean;
  clearSpeedoverground(): void;
  getSpeedoverground(): number;
  setSpeedoverground(value: number): void;

  hasCourseoverground(): boolean;
  clearCourseoverground(): void;
  getCourseoverground(): number;
  setCourseoverground(value: number): void;

  hasMagneticcourse(): boolean;
  clearMagneticcourse(): void;
  getMagneticcourse(): number;
  setMagneticcourse(value: number): void;

  hasWindangle(): boolean;
  clearWindangle(): void;
  getWindangle(): number;
  setWindangle(value: number): void;

  getPiloting(): boolean;
  setPiloting(value: boolean): void;

  getHasgpsfix(): boolean;
  setHasgpsfix(value: boolean): void;

  hasTargetheading(): boolean;
  clearTargetheading(): void;
  getTargetheading(): number;
  setTargetheading(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeviceData.AsObject;
  static toObject(includeInstance: boolean, msg: DeviceData): DeviceData.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeviceData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeviceData;
  static deserializeBinaryFromReader(message: DeviceData, reader: jspb.BinaryReader): DeviceData;
}

export namespace DeviceData {
  export type AsObject = {
    latitude: number,
    longitude: number,
    speedoverground: number,
    courseoverground: number,
    magneticcourse: number,
    windangle: number,
    piloting: boolean,
    hasgpsfix: boolean,
    targetheading: number,
  }
}

export class SecretValue extends jspb.Message {
  getSecret(): string;
  setSecret(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecretValue.AsObject;
  static toObject(includeInstance: boolean, msg: SecretValue): SecretValue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SecretValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecretValue;
  static deserializeBinaryFromReader(message: SecretValue, reader: jspb.BinaryReader): SecretValue;
}

export namespace SecretValue {
  export type AsObject = {
    secret: string,
  }
}

export class Pilot extends jspb.Message {
  getPilot(): boolean;
  setPilot(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Pilot.AsObject;
  static toObject(includeInstance: boolean, msg: Pilot): Pilot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Pilot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Pilot;
  static deserializeBinaryFromReader(message: Pilot, reader: jspb.BinaryReader): Pilot;
}

export namespace Pilot {
  export type AsObject = {
    pilot: boolean,
  }
}

export class FreeMemory extends jspb.Message {
  getMemory(): number;
  setMemory(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FreeMemory.AsObject;
  static toObject(includeInstance: boolean, msg: FreeMemory): FreeMemory.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FreeMemory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FreeMemory;
  static deserializeBinaryFromReader(message: FreeMemory, reader: jspb.BinaryReader): FreeMemory;
}

export namespace FreeMemory {
  export type AsObject = {
    memory: number,
  }
}

export class PrintContents extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  getLvl(): MessageLevelMap[keyof MessageLevelMap];
  setLvl(value: MessageLevelMap[keyof MessageLevelMap]): void;

  getFreememory(): number;
  setFreememory(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrintContents.AsObject;
  static toObject(includeInstance: boolean, msg: PrintContents): PrintContents.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrintContents, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrintContents;
  static deserializeBinaryFromReader(message: PrintContents, reader: jspb.BinaryReader): PrintContents;
}

export namespace PrintContents {
  export type AsObject = {
    message: string,
    lvl: MessageLevelMap[keyof MessageLevelMap],
    freememory: number,
  }
}

export class StreamDataRequest extends jspb.Message {
  getStreamrefreshrate(): number;
  setStreamrefreshrate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamDataRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamDataRequest): StreamDataRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamDataRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamDataRequest;
  static deserializeBinaryFromReader(message: StreamDataRequest, reader: jspb.BinaryReader): StreamDataRequest;
}

export namespace StreamDataRequest {
  export type AsObject = {
    streamrefreshrate: number,
  }
}

export class Request extends jspb.Message {
  getType(): RequestTypeMap[keyof RequestTypeMap];
  setType(value: RequestTypeMap[keyof RequestTypeMap]): void;

  hasNamechange(): boolean;
  clearNamechange(): void;
  getNamechange(): ChangeName | undefined;
  setNamechange(value?: ChangeName): void;

  hasWindangle(): boolean;
  clearWindangle(): void;
  getWindangle(): WindAngle | undefined;
  setWindangle(value?: WindAngle): void;

  hasPiloting(): boolean;
  clearPiloting(): void;
  getPiloting(): Pilot | undefined;
  setPiloting(value?: Pilot): void;

  hasSecret(): boolean;
  clearSecret(): void;
  getSecret(): SecretValue | undefined;
  setSecret(value?: SecretValue): void;

  hasEmpty(): boolean;
  clearEmpty(): void;
  getEmpty(): Empty | undefined;
  setEmpty(value?: Empty): void;

  hasHeading(): boolean;
  clearHeading(): void;
  getHeading(): HeadToHeadingRequest | undefined;
  setHeading(value?: HeadToHeadingRequest): void;

  hasStreamdatarequest(): boolean;
  clearStreamdatarequest(): void;
  getStreamdatarequest(): StreamDataRequest | undefined;
  setStreamdatarequest(value?: StreamDataRequest): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getStreamid(): number;
  setStreamid(value: number): void;

  getMessageCase(): Request.MessageCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Request.AsObject;
  static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Request;
  static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
}

export namespace Request {
  export type AsObject = {
    type: RequestTypeMap[keyof RequestTypeMap],
    namechange?: ChangeName.AsObject,
    windangle?: WindAngle.AsObject,
    piloting?: Pilot.AsObject,
    secret?: SecretValue.AsObject,
    empty?: Empty.AsObject,
    heading?: HeadToHeadingRequest.AsObject,
    streamdatarequest?: StreamDataRequest.AsObject,
    messageid: number,
    streamid: number,
  }

  export enum MessageCase {
    MESSAGE_NOT_SET = 0,
    NAMECHANGE = 2,
    WINDANGLE = 3,
    PILOTING = 4,
    SECRET = 5,
    EMPTY = 6,
    HEADING = 8,
    STREAMDATAREQUEST = 10,
  }
}

export class IdentifyResponse extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getVersion(): string;
  setVersion(value: string): void;

  getSerialnumber(): string;
  setSerialnumber(value: string): void;

  getFirmwareversion(): string;
  setFirmwareversion(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IdentifyResponse.AsObject;
  static toObject(includeInstance: boolean, msg: IdentifyResponse): IdentifyResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: IdentifyResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IdentifyResponse;
  static deserializeBinaryFromReader(message: IdentifyResponse, reader: jspb.BinaryReader): IdentifyResponse;
}

export namespace IdentifyResponse {
  export type AsObject = {
    name: string,
    version: string,
    serialnumber: string,
    firmwareversion: string,
  }
}

export class Response extends jspb.Message {
  getType(): ResponseTypeMap[keyof ResponseTypeMap];
  setType(value: ResponseTypeMap[keyof ResponseTypeMap]): void;

  hasHeading(): boolean;
  clearHeading(): void;
  getHeading(): CourseHeading | undefined;
  setHeading(value?: CourseHeading): void;

  hasData(): boolean;
  clearData(): void;
  getData(): DeviceData | undefined;
  setData(value?: DeviceData): void;

  hasCapabilites(): boolean;
  clearCapabilites(): void;
  getCapabilites(): GetCapabilitesResponse | undefined;
  setCapabilites(value?: GetCapabilitesResponse): void;

  hasEmpty(): boolean;
  clearEmpty(): void;
  getEmpty(): Empty | undefined;
  setEmpty(value?: Empty): void;

  hasAngle(): boolean;
  clearAngle(): void;
  getAngle(): WindAngle | undefined;
  setAngle(value?: WindAngle): void;

  hasMemory(): boolean;
  clearMemory(): void;
  getMemory(): FreeMemory | undefined;
  setMemory(value?: FreeMemory): void;

  hasTelemetrycontents(): boolean;
  clearTelemetrycontents(): void;
  getTelemetrycontents(): PrintContents | undefined;
  setTelemetrycontents(value?: PrintContents): void;

  hasIdentify(): boolean;
  clearIdentify(): void;
  getIdentify(): IdentifyResponse | undefined;
  setIdentify(value?: IdentifyResponse): void;

  getMessageid(): number;
  setMessageid(value: number): void;

  getStreamid(): number;
  setStreamid(value: number): void;

  getMessageCase(): Response.MessageCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Response.AsObject;
  static toObject(includeInstance: boolean, msg: Response): Response.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Response, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Response;
  static deserializeBinaryFromReader(message: Response, reader: jspb.BinaryReader): Response;
}

export namespace Response {
  export type AsObject = {
    type: ResponseTypeMap[keyof ResponseTypeMap],
    heading?: CourseHeading.AsObject,
    data?: DeviceData.AsObject,
    capabilites?: GetCapabilitesResponse.AsObject,
    empty?: Empty.AsObject,
    angle?: WindAngle.AsObject,
    memory?: FreeMemory.AsObject,
    telemetrycontents?: PrintContents.AsObject,
    identify?: IdentifyResponse.AsObject,
    messageid: number,
    streamid: number,
  }

  export enum MessageCase {
    MESSAGE_NOT_SET = 0,
    HEADING = 2,
    DATA = 3,
    CAPABILITES = 4,
    EMPTY = 5,
    ANGLE = 6,
    MEMORY = 7,
    TELEMETRYCONTENTS = 8,
    IDENTIFY = 10,
  }
}

export interface RequestTypeMap {
  READ_HEADING: 0;
  HEAD_TO_HEADING: 1;
  CALIBRATE: 2;
  CALIBRATE_END: 3;
  CHANGE_NAME: 4;
  GET_CAPABILITIES: 5;
  SET_PIN: 6;
  SET_WIND_ANGLE: 7;
  GET_WIND_ANGLE: 8;
  GET_DATA: 9;
  STREAM_DATA: 10;
  STOP_STREAM: 11;
  SECRET_VALUE: 12;
  TOGGLE_PILOT: 13;
  REPORT_FREE_MEMORY: 14;
  PING: 15;
  IDENTIFY: 16;
  START_TELEMETRY: 17;
}

export const RequestType: RequestTypeMap;

export interface ResponseTypeMap {
  HEADINGRESULT: 0;
  TARGETHEADINGRESULT: 1;
  CALIBRATE_FINISHED: 2;
  CAPABILITESRESULT: 3;
  WINDANGLERESULT: 4;
  DATARESULT: 5;
  FREEMEMORYRESULT: 6;
  PRINT: 7;
  PONG: 8;
  IDENTIFYRESULT: 9;
  TELEMETRYRESULT: 10;
}

export const ResponseType: ResponseTypeMap;

export interface AutopilotStateMap {
  STANDBY: 0;
  PILOTING_TO_HEADING: 1;
  PILOTING_TO_WIND: 2;
  CALIBRATING: 3;
}

export const AutopilotState: AutopilotStateMap;

export interface MessageLevelMap {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
  TRACE: 5;
}

export const MessageLevel: MessageLevelMap;

