import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalStorage = <T>(key: string) => {
    const [data, setData] = useState<T | null>(null)
    useEffect(() => {
        AsyncStorage.getItem(key).then(retrievedData => {
            if (retrievedData !== null) {
                setData(JSON.parse(retrievedData));
            }
        });
    }, []);
    const saveData = (_data: T | ((old: T) => T)) => {
        if (typeof _data === 'function') {
            const newData = (_data as any)(data);
            AsyncStorage.setItem(key, JSON.stringify(newData)).then( () => {
                setData(newData);
            });
        }
    }
    return [data, saveData] as const;
}