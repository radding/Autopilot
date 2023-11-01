// @ts-expect-error
import CompassHeading from 'react-native-compass-heading';
import React, { useEffect, useState } from "react";

export const useDeviceCompass = () => {
    const [values, setValues] = useState({heading: 0, accuracy: 0});
  useEffect(() => {
    const degree_update_rate = 3;

    CompassHeading.start(degree_update_rate, ({heading, accuracy}: any) => {
        console.log("Info", heading, accuracy);
        setValues({ heading, accuracy });
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);
  return values;
}