import chalk from "chalk";
import ora from "ora";
import { CommunicationChannel } from "../communication_channel/type";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { SerialPort } from "serialport";

export class Serial implements CommunicationChannel<{name: string, address: string, port: string, baudRate: number}> {

    private port: SerialPort | null = null;
    private readCB: ((data: Uint8Array) => void) | null = null;

    constructor() {
       
    //     this.port = "COM3";
    //     this.baudRate = 115200;
    }

    async connect(options: {name: string, address: string, port: string, baudRate: number | string}) {
        if (typeof options.baudRate === 'string') {
            options.baudRate = parseInt(options.baudRate);
        }
        this.port = new SerialPort({
            path: options.port,
            baudRate: options.baudRate
        });
        while (!this.port.isOpen) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log(chalk.green('Connected to serial port'));
    }

    async search(): Promise<{name: string, address: string, port: string, baudRate: number}[]> {
       const ports = await SerialPort.list();
       return ports.map(port => ({
        name: port.path,
        address: port.path,
        port: port.path,
        baudRate: 9600
       }));
    }

    async disconnect() {
        console.log(chalk.blue('Disconnecting from serial port...'));
        this.port?.close();
    }

    onMessage(cb: (data: Uint8Array) => void): void {
        if (this.readCB) {
            this.port?.removeListener("data", this.readCB);
        }
        this.readCB = (data) => {
            cb(data);
            // this.port?.flush();
        }
        this.port?.on("data", this.readCB);
    }

    write(data: Uint8Array): void {
        if (!this.port) {
            throw new Error('Not connected to serial port');
        }
        this.port.write(data, "binary", (err) => {
            if (err) {
                console.error(chalk.red('Error writing to serial port'), err);
            }
        });
    }
}