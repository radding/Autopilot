import { Writer } from "@autopilot/library";

export interface CommunicationChannel<T extends {name: string, address: string, port: string}> extends Writer {
    search(): Promise<T[]>;
    connect(options: T): Promise<void>;
    disconnect(): Promise<void>;
}