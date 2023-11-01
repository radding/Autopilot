import {NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ComparisonScreen } from './src/screens/Comparison';
import { PilotByCompass } from './src/screens/PilotByCompass';
import { AutopilotProvider } from './src/Autopilot/Index';
import { SettingsScreen } from './src/screens/settings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BluetoothConnectScreen } from './src/screens/settings/bluetooth';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BluetoothProvider } from './src/Autopilot/bluetooth/context';
import { EnsureConection } from './src/components/EnsureConnection';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const wrapInEnsure = (Component: any) => {
  return (props: any) => {
    return <EnsureConection {...props}>
      <Component />
    </EnsureConection>
  }
}

const MainWindow = () => (
        <Tab.Navigator initialRouteName='CompassPilot'>
          <Tab.Screen component={wrapInEnsure(PilotByCompass)} name='CompassPilot' options={{
            tabBarLabel: "Pilot by Compass",
            tabBarIcon: (props) => <MaterialCommunityIcons name="compass-rose" size={24} color={props.color}/>
          }}/>
          <Tab.Screen component={wrapInEnsure(SettingsScreen)} name="Settings" options={{
            tabBarIcon: (props) => <MaterialIcons name='settings'  size={24} color={props.color}/>
          }}/>
          <Tab.Screen component={wrapInEnsure(ComparisonScreen)} name='DeviceStatus' options={{
            tabBarLabel: "Device Debugging",
            tabBarIcon: (props) => <MaterialCommunityIcons name="bug-outline" size={24} color={props.color} />
          }}/>
        </Tab.Navigator>
)

export default function App() {
  return (
    <BluetoothProvider >
      <AutopilotProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Main'>
            <Stack.Screen component={MainWindow} name="Main" options={{ headerShown: false }}/>
            <Stack.Screen component={BluetoothConnectScreen} name='BluetoothConnect' options={{
              title: "Discover Autopilot",
            }}/>
          </Stack.Navigator>
        </NavigationContainer>
      </AutopilotProvider>
    </BluetoothProvider>
  );
}

