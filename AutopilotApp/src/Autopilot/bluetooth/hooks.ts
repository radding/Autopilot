import { useCallback, useState, useEffect } from "react";
import { compassServiceUUID } from "../services";
import { useBluetooth } from "./context";
import BleManager from 'react-native-ble-manager';
import { Buffer } from "buffer";


export const useSend = (characteristic: string) => {
    const { connectedTo } = useBluetooth();
    return useCallback((value: number[] | string) => {
        if (!connectedTo) {
            console.warn("Writing before connected");
            return null;
        }
        let valueToSend: number[] = value as number[];
        if (typeof value === 'string' || value instanceof String) {
            valueToSend = [...Buffer.from(value, "utf-8")]
        }
        return BleManager.write(connectedTo.id, compassServiceUUID, characteristic, valueToSend)
    }, [connectedTo]);
}

export const useSubscribeToCharacteristic = <T>(characteristic: string, converter: (arr: number[]) => T) => {
    const data = useBluetooth();
    const [value, setData] = useState<T | null>(null);

    useEffect(() => {
        if (!data.connectedTo) {
            console.warn("not connected");
            return;
        }
        if (!Object.prototype.hasOwnProperty.call(data.subscriptions, characteristic)) {
            BleManager
                .startNotification(data.connectedTo.id, compassServiceUUID, characteristic)
                .then(() => data.addSubscription(characteristic));
        }
        else {
            data.addSubscription(characteristic);
        }
        return () => data.removeSubscription(characteristic);
    }, [data.connectedTo]);
    
    useEffect(() => {
        setData(converter(data.subscriptions[characteristic]?.lastPayload));
    }, [data.subscriptions[characteristic]]);
    return value;
}

export const useSubscribeToNumberCharacteristic = (characteristic: string) => {
    return useSubscribeToCharacteristic(characteristic, (value: number[]): number => {
        return Buffer.from(value).readIntBE(0, Math.min(value.length, 6));
    })
}