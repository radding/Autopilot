import { createContext, useContext, useState, useEffect, PropsWithChildren, useCallback } from "react";
import { BleManagerEmitter, startBle } from ".";
import BleManager, { BleScanCallbackType, BleScanMatchMode, BleScanMode } from 'react-native-ble-manager';
import { compassServiceUUID } from "../services";

type BTEContext = {
    state: "connecting" | "scanning" | "connected" | "disconnected" | "initializing" | "stopped_scanning";
    devices: Record<string, { id: string, name: string, rssi: number }>;
    subscriptions: Record<string, {subscribers: number, lastPayload: number[]}>;
    connectedTo: { id: string, name: string, characteristics: string[] } | null;
    setState: (newState: BTEContext['state']) => void;
    clearDevices: () => void;
    addDiscoveredDevices: (devices: BTEContext['devices']) => void;
    setConnected: (id: string, name: string, characteristics: string[]) => void;
    addSubscription: (id: string) => void;
    removeSubscription: (id: string) => void;
}

const BTEContext = createContext<BTEContext | null>(null);

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export const BluetoothProvider = (props: PropsWithChildren) => {
    const [bluetoothState, setState] = useState<NonFunctionProperties<BTEContext>>({
        state: "initializing",
        devices: {},
        connectedTo: null,
        subscriptions: {},
    });
    
    useEffect(() => {
     (async () => {
        await startBle();
        setState(cur => ({
            ...cur,
            state: "disconnected",
        }))
     })() 
    }, []);

    useEffect(() => {
        const subscriber = BleManagerEmitter.addListener(
    "BleManagerDidUpdateValueForCharacteristic",
    ({ value, peripheral, characteristic, service }) => {
      if (peripheral !== bluetoothState.connectedTo?.id || service !== compassServiceUUID) {
        console.warn("Got a value I was not prepared for:", characteristic, peripheral, service);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(bluetoothState.subscriptions, characteristic)) {
        setState(cur => ({
            ...cur,
            subscriptions: {
                ...bluetoothState.subscriptions,
                [characteristic]: {
                    ...bluetoothState.subscriptions[characteristic],
                    lastPayload: value,
                }
            }
        }));
      }
      else {
        console.warn(`Got notification for ${peripheral}:${service}${characteristic}: ${JSON.stringify(value)}`);
      }
    }
  );
  return () => subscriber.remove();
    })

    return (
        <BTEContext.Provider value={{
            ...bluetoothState,
            setState: (newState) => {
                setState(cur => ({...cur, state: newState}));
            },
            clearDevices: () => setState(cur => ({...cur, devices: {}})),
            addDiscoveredDevices: (devices) => {
                setState(cur => ({...cur, devices: {
                    ...cur.devices,
                    ...devices,
                }}));
            },
            setConnected: (deviceID: string, name: string, characteristics: string[]) => {
                setState(cur => ({
                    ...cur,
                    connectedTo: {id: deviceID, name, characteristics,}
                }))
            },
            addSubscription: (characteristic: string) => {
                const value = bluetoothState.subscriptions[characteristic] || {
                    subscribers: 0,
                    lastPayload: [],
                };
                value.subscribers += 1;

                setState(cur => ({
                    ...cur,
                    subscriptions: {
                        ...cur.subscriptions,
                        [characteristic]: {
                            ...value,
                        },
                    }
                }))
            },
            removeSubscription: (characteristic: string) => {
                const newSubs = {...bluetoothState.subscriptions};
               newSubs[characteristic].subscribers -= 1;
                setState(cur => ({
                    ...cur,
                    subscriptions: newSubs,
                }))
            }
        }}>
            {props.children}
        </BTEContext.Provider>
    )
}


export const useBluetooth = () => {
    const data = useContext(BTEContext);
    if (data === null) {
        throw new Error("BTE must be used within BTE context");
    }
    return {
        ...data,
    };
}

export const useDisconnect = () => {
    const data = useBluetooth();
    return useCallback(async (force?: boolean) => {
        if (data.connectedTo === null) {
            console.warn("Connect was called with out being connected to a device!");
            return 
        }
        await BleManager.disconnect(data.connectedTo.id, force);
        data.setState("disconnected");
    }, [data.connectedTo]);
}

export const useConnect = () => {
    const data = useBluetooth();
    const connect = useCallback(async (deviceID: string): Promise<BTEContext["connectedTo"]> => {
        if (data.connectedTo?.id !== deviceID && data.connectedTo?.id) {
            BleManager.disconnect(data.connectedTo?.id);
        } else if (data.connectedTo?.id === deviceID) {
            return data.connectedTo;
        }
        console.info("Connecting to device:", deviceID);
        data.setState("connecting");
        await BleManager.connect(deviceID, {
            autoconnect: true,
        });
        const deviceInfo = await BleManager.retrieveServices(deviceID);
        const connectedDevice = {
            id: deviceInfo.id,
            name: deviceInfo.name || deviceID,
            characteristics: deviceInfo.characteristics?.map(char => char.characteristic) || [],
        };
        data.setConnected(connectedDevice.id, connectedDevice.name, connectedDevice.characteristics);
        data.setState("connected");
        console.log("connected to:", deviceInfo);
        return connectedDevice;
    }, [data.connectedTo]);
    return connect;
}

export const useScanDevices = () => {
    const context = useBluetooth();
    const pairDevice = useConnect();

    const startScan = useCallback(async () => {
        if (context.state !== "scanning") {
            await BleManager.scan([], 10, false)
                .then(() => {
                    context.clearDevices();
                    console.log('Scanning...');
                    context.setState("scanning");
                })
                .catch(error => {
                    console.error(error);
                });
            const peripherals = await BleManager.getConnectedPeripherals();
            context.addDiscoveredDevices(peripherals.reduce((acc, perf) => ({...acc, [perf.id]: {id: perf.id, name: perf.name || perf.id, rssi: perf.rssi }}), {}));
            const bonded = await BleManager.getBondedPeripherals();
            context.addDiscoveredDevices(bonded.reduce((acc, perf) => ({...acc, [perf.id]: {id: perf.id, name: perf.name || perf.id, rssi: perf.rssi }}), {}));
    }
  }, [context.state]);

  useEffect(() => {
    startScan();
  }, []);
    useEffect(() => {
         let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
    //     context.addDiscoveredDevices({
    //         [peripheral.id]: {
    //         id: peripheral.id,
    //         name: peripheral.name || peripheral.id,
    //         rssi: peripheral.rssi,
    //     }
    // })
      },
    );
        let stopListener = BleManagerEmitter.addListener(
            'BleManagerStopScan',
            () => {
                BleManager.getDiscoveredPeripherals().then((res) => {
                    const devs = res.reduce((acc, perf) => ({
                        ...acc,
                        [perf.id]: {
                            id: perf.id,
                            name: perf.name || perf.id,
                            rssi: perf.rssi,
                        }
                    }), {} as any);
                    context.addDiscoveredDevices(devs);
                });
                context.setState("stopped_scanning");   
            },
        );
        return () => {
            stopListener.remove();
            stopDiscoverListener.remove();
        }
    }, []);
    return { 
        devices: context.devices,
        state: context.state, 
        rescan: startScan, 
        stopScan: BleManager.stopScan,
        pairDevice,
    };
}
