import React, { useState, useCallback, useContext, useEffect } from "react";
import { NonFunctionProperties, useBluetooth, useConnect, useDisconnect } from "./bluetooth/context";
import { changeNameCharacteristicUUID, headingCharacteristicUUID } from "./services";
import { useLocalStorage } from "./useLocalStorage";
import { useSend } from "./bluetooth/hooks";
import { Buffer } from "buffer";



export enum AutopilotMode {
    off = "OFF",
    standby = "STANDBY",
    compassPilot = "COMPASS_PILOT",
    calibrate = "CALIBRATE",
    searching = "SEARCHING",
    connected = "CONNECTED",
    error = "ERROR"
}

export enum AutopilotCapabilities {
    compass = "COMPASS",
    windAngle = "WIND_ANGLE",
}

type AutopilotContext = {
    name: string;
    mode: AutopilotMode;
    currentHeading: number;
    desiredHeading: number;
    currentApparentWindAngle: number;
    desiredApparentWindAngle: number;
    error: number;
    capabilities: Set<string>;
    setDesiredHeading: (heading: number) => Promise<void>;
    setDesiredWindAngle: (windAngle: number) => Promise<void>;
    hasCapability: (capability: AutopilotCapabilities) => boolean;
    setName: (name: string) => Promise<void>;
}

type AutopilotState = NonFunctionProperties<AutopilotContext>;
const Context = React.createContext<AutopilotContext | null>(null);

export const AutopilotProvider = (props: React.PropsWithChildren) => {
    const { connectedTo, state } = useBluetooth();
    const disconnect = useDisconnect();
    const connect = useConnect();
    const setNameBle = useSend(changeNameCharacteristicUUID);
    const [previousDevice, saveDevices] = useLocalStorage<string>("@Autopilot/devices");

    const [autopilotState, setState] = useState<AutopilotState>({
        currentHeading: 0,
        mode: AutopilotMode.searching,
        desiredHeading: 0,
        currentApparentWindAngle: 0,
        desiredApparentWindAngle: 0,
        error: 0,
        capabilities: new Set(),
        name: "",
    });

    const setName = (name: string) => {
        console.log("Attempting to set name:", name);
        const val = Buffer.from(name, "utf-8");
        if (val.length > 255) {
            throw new Error("Name can be max 255 characters");
        }
        const buf = new Array(255).fill(0).map((value, ndx) => {
            if (val[ndx]) {
                return val[ndx];
            }
            return value;
        });
        console.log("Sending:", buf);
        return setNameBle(buf)!;
    }

    useEffect(() => {
        if (previousDevice != null) {
            console.log("I have previously saved this device, so connectint to it");
            connect(previousDevice);
        }
    }, []);

    useEffect(() => {
        if (state === "stopped_scanning" || state === "disconnected") {
            setState(cur => ({
                ...cur,
                mode: AutopilotMode.off,
            }))
        }
    }, [state]);

    useEffect(() => {
        if (!connectedTo) {
            if (state === "connecting") {
                setState(cur => ({
                    ...cur,
                    mode: AutopilotMode.searching,
                }))
            }
            return;
        }
        
        if (!connectedTo.characteristics.includes(headingCharacteristicUUID)) {
            console.warn("This is not an autopilot device, disconnecting", connectedTo.characteristics);
            disconnect(true);
            return
        }
        console.log("connected to a device, saving it for next time!")
        saveDevices(connectedTo?.id);
        setState(cur => ({
            ...cur,
            mode: AutopilotMode.connected,
        }));
    }, [connectedTo]);


    const setDesiredHeading = useCallback(async (desiredHeading: number) => {
        console.log("I would set desired heading here");
    }, [setState]);


    const setDesiredWindAngle = useCallback(async (desiredWindAngle: number) => {
        console.log("I would set desired wind angle here");
    }, [setState]);

    const hasCapability = useCallback((cap: AutopilotCapabilities) => {
        return autopilotState.capabilities.has(cap);
    }, [autopilotState.capabilities]);

    return <Context.Provider value={{...autopilotState, setName, setDesiredHeading, setDesiredWindAngle, hasCapability, name: connectedTo?.name || ""}}>
        {props.children}
    </Context.Provider>
}


export const useAutopilot = (): AutopilotContext => {
    const context = useContext(Context);
    if (context === null) {
        throw new Error("You are not within an autopilot context");
    }
    return context;
}
