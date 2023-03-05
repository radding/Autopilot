
import { AutopilotClient } from "./Autopilot";
import winston, { log } from "winston";
import { BluetoothSerialPort } from "bluetooth-serial-port"
import { BluetoothClient } from "./bluetooth/Bluetooth";

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
		port: "COM3",
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

interface BtInfo { addr: string, name: string };

export const searchForDeviceWithName = (nameToFind: string, timeoutMS: number = 10000) => {
	return new Promise<{ client: BluetoothSerialPort, devices: BtInfo }>((res, rej) => {
		const btObj = new BluetoothSerialPort();
		btObj.on("found", (addr: string, name: string) => {
			if (name === nameToFind) {
				res({
					client: btObj,
					devices: { addr, name },
				});

			}
		});
		setTimeout(() => {
			rej(new Error(`unable to find device with name ${nameToFind} in ${timeoutMS} miliseconds`));
		}, timeoutMS);
		btObj.inquire();
	});

}

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
	return new Promise<BluetoothSerialPort>((res, rej) => {
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

export const searchDevices = async (timeoutMS: number = 1000, min: number = 2) => {
	const {client, devices} = await searchBT(timeoutMS, min);
	return devices.map(device => new BlueToothDeviceCreator(client, device.addr));
}

export const GetHC06 = async (timeoutMS: number = 1000) => {
	const hc06 = await searchForDeviceWithName("HC-06", timeoutMS);
	const dev = await connect(hc06.client, hc06.devices.addr);
	return new BluetoothClient(dev);
};


class BlueToothDeviceCreator {
	constructor(private device: BluetoothSerialPort, public readonly addr: string){}

	public async getDevice(): Promise<BluetoothClient> {
		const dev = await connect(this.device, this.addr);
		return new BluetoothClient(dev);
	}
}