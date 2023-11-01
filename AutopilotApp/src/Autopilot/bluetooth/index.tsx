import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from "react-native";
import BleManager from 'react-native-ble-manager';

export const BleManagerModule = NativeModules.BleManager;
export const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const enableBle = async () => {
    console.log("Checking bluetooth is enabled");
    await BleManager.enableBluetooth();
    console.log("Bluetooth is enabled");
    if (Platform.OS === 'android' && Platform.Version >= 23) {
        console.log("Checking Android permissions");
        let hasPerms = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        hasPerms = hasPerms && await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        );
        hasPerms = hasPerms && await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        )
        if (!hasPerms) {
            let granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            )

            granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            )
            return !!granted;
        }
        return true;
    }
    return true;
}

export const startBle = async () => {
    const hasPerms = await enableBle();
    if (!hasPerms) {
        throw new Error("Need BLE permissions, don't have that");
    }
    console.log("Starting BLE manager");
    await BleManager.start({forceLegacy: true});
    console.log("Started BLE manager");
}

const useBluetooth = () => {

}
