
import { AutopilotClient } from "./Autopilot";
import winston, { log } from "winston";
import { BluetoothSerialPort } from "bluetooth-serial-port"

export { GetBearingCommand } from "./cmds/GetBearingCmd";
export { BeginPilotCompassCmd } from "./cmds/BeginPilotCmd";
export { SetDesiredBearingCmd } from "./cmds/SetDesiredBearingCmd";
export { HeadingStream } from "./cmds/HeadingStream";


export const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
	],
	level: "debug",
});


export const autopilot = new AutopilotClient({
	serialConfig: {
		port: "/dev/ttyACM0",
	},
	logger: {
		...logger,
		trace: (...message: any[]) => (logger.log as any)("debug", ...message),
		info: (...message: any[]) => (logger.log as any)("info", ...message),
		error: (...message: any[]) => (logger.log as any)("error", ...message),
		warn: (...message: any[]) => (logger.log as any)("warn", ...message),
	},
	disableHeartbeat: true,
});

export const createBtAutopilot = () => {
	new AutopilotClient({
		serialConfig: {}
	});
}

interface BtInfo { addr: string, name: string }

export const searchBT = (timeoutMS: number = 1000, min: number = 2) => {
	return new Promise<{ client: BluetoothSerialPort, devices: BtInfo[] }>(res => {
		const found: BtInfo[] = [];
		const btObj = new BluetoothSerialPort();
		btObj.on("found", (addr: string, name: string) => {
			found.push({ addr, name });
			console.log("found", addr, name);
			if (found.length >= min) {
				res({
					client: btObj,
					devices: found,
				});

			}
		});
		setTimeout(() => {
			res({
				client: btObj,
				devices: found,
			});
		}, timeoutMS);
		btObj.inquire();
	});
};

export const connect = (device: BluetoothSerialPort, deviceAddr: string) => {
	return new Promise((res, rej) => {
		device.findSerialPortChannel(deviceAddr, (chan: number) => {
			device.connect(deviceAddr, chan, () => {
				console.log("connected:", deviceAddr, chan);
				res(device);
			}, (err) => {
				console.log("error connecting:", err);
				rej(err);
			})
		}, rej);
	});
}