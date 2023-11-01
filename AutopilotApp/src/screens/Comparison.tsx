import { View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { Compass } from "../components/compass";
import { useDeviceCompass } from '../compass/useDeviceCompass';

export const ComparisonScreen = () => {
  const deviceOrientation = useDeviceCompass();
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView> 
                <View style={styles.compassContainer}>
                    <Text>Device Compass</Text>
                    <Compass orentation={deviceOrientation.heading}/>
                </View>
                <View style={styles.compassContainer}>
                    <Text>Autopilot Compas Compass</Text>
                    <Compass orentation={deviceOrientation.heading}/>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassContainer: {
  }
});