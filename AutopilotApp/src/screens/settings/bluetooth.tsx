import React, { useEffect, useState } from "react";
import { Button, Text, View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScanDevices } from "../../Autopilot/bluetooth/context";

export const BluetoothConnectScreen = () => {
    const { devices, state, rescan, stopScan, pairDevice } = useScanDevices();

    useEffect(() => {
       let timer: NodeJS.Timeout;
       console.log("Got state:", state);
       if (state === "scanning") {
            timer = setTimeout(() => {
                console.log("STOP SCANNING");
                stopScan();
            }, 10 * 1000);
       }
    }, [state]);
    return <SafeAreaView style={{padding: 16}}>
        <ScrollView>
            {state === "stopped_scanning" && Object.keys(devices).length === 0 && (<View>
                <Text style={{textAlign: "center"}}>No devices Found</Text>
            </View>)}
            {state === "scanning" && (<View style={{
                ...styles.row,
                justifyContent: "center",
                flexDirection: "column",
                }}
            >
                <Button title="Stop Scan" onPress={() => stopScan()} />
            </View>)}
            { state === "connecting" && <View>
                <Text>Connecting</Text>
            </View>}
            {state !== "connecting" && Object.values(devices).map((device => {
                return <View key={device.id} style={styles.row}>
                    <Text>{device.name}</Text>
                    <Button onPress={() => pairDevice(device.id)} title="Connect" />
                </View>
            }))}
            {state === "scanning" && (<View style={{
                ...styles.row,
                justifyContent: "center",
                flexDirection: "column",
                }}
            >
                <ActivityIndicator size="large"></ActivityIndicator>
            </View>)}
            {state !== "scanning" && (<View style={{
                ...styles.row,
                justifyContent: "center",
                flexDirection: "column",
            }}>
                <Button title="Re-Scan for devices" onPress={() => rescan()} />
            </View>)}
        </ScrollView>
    </SafeAreaView>
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        padding: 32,
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "space-between",
    }
})