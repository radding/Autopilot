import React, { useEffect } from "react";
import { Button, SafeAreaView, ScrollView, Text, View, StyleSheet, Dimensions } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { AutopilotMode, useAutopilot } from "../../Autopilot/Index";
import { EnsureConection } from "../../components/EnsureConnection";
import { useBluetooth } from "../../Autopilot/bluetooth/context";


export const SettingsScreen = (props: BottomTabScreenProps<never>) => {
    const autopilot = useAutopilot();
    const { connectedTo } = useBluetooth();
    const dimensions = Dimensions.get('window');
    useEffect(() => {
        autopilot.setName("TESTNAME");
        console.log("CONNECTED TO:", connectedTo);
    }, []);
    
    return <Text>Connected!</Text>
   
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "space-between",
    }
})