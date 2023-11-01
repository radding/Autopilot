import React from "react";
import { AutopilotMode, useAutopilot } from "../Autopilot/Index";
import { SafeAreaView, ScrollView, View, Button, StyleSheet, Text, Dimensions, ActivityIndicator } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export const EnsureConection = (props: React.PropsWithChildren<BottomTabScreenProps<never>>) => {
    const { mode } = useAutopilot();
    const dimensions = Dimensions.get('window');
  return (<SafeAreaView>
        <ScrollView style={{ padding: 16 }}>
            {mode === AutopilotMode.off && (
            <View style={{
                height: dimensions.height,
                alignContent: "center",
                justifyContent: "center",
            }}>
                <View style={styles.row}>
                    <Text>Not Connect to an Autopilot</Text>
                    <Button onPress={() => props.navigation.getParent()?.navigate("BluetoothConnect")} title="Connect" />
                </View>
            </View>
            )}
            {mode === AutopilotMode.searching && (
                <View style={{
                    height: dimensions.height,
                    alignContent: "center",
                    justifyContent: "center",
                }}>
                    <View style={styles.row}>
                        <Text>Connecting</Text>
                        <ActivityIndicator />
                    </View>
                </View>
            )}
            {mode === AutopilotMode.connected && 
                    React.Children.map(props.children, (child: any) => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { ...props });
                        }
                        return null;
                    })
            }
        </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "space-between",
    }
})