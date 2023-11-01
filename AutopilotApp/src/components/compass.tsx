import React from "react";
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';

type Props = {
    orentation: number;
}

export const Compass = (props: Props) => {
    const dimensions = Dimensions.get('window');
    const imageWidth = dimensions.width - 10;
    const imageHeight = Math.round(imageWidth * 3202/3217) + 4;
    return (
        
        <View style={{ justifyContent: "center", alignItems: "center" }}>
            <View style={{backgroundColor: "red", width: 10, height: 10, borderRadius: 50, position: "relative", bottom: -25}}></View>
            <Image source={require("../../assets/compassRose.png")} style={{width: imageWidth, height: imageHeight, transform: [{rotate: `${props.orentation}deg`}]}}></Image>
            <Text>Heading: {props.orentation}</Text>
        </View>
    )
}