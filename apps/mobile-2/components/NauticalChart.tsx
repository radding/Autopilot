import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Svg, { Line, Polygon } from 'react-native-svg';

// Props: latitude, longitude, heading (degrees)
type NauticalChartProps = {
  latitude: number;
  longitude: number;
  heading: number;
};

export const NauticalChart: React.FC<NauticalChartProps> = ({
  latitude,
  longitude,
  heading,
}) => {
  // Arrow size and style
  const arrowLength = 40;
  const arrowWidth = 16;

  // Arrow SVG points (centered at 0,0, pointing up)
  const arrowPoints = [
    { x: 0, y: -arrowLength }, // tip
    { x: arrowWidth / 2, y: arrowLength / 2 },
    { x: 0, y: arrowLength / 4 },
    { x: -arrowWidth / 2, y: arrowLength / 2 },
  ];

  // Convert heading to rotation (MapView Marker rotates in degrees)
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <Svg
            height={arrowLength * 2}
            width={arrowLength * 2}
            style={{ transform: [{ rotate: `${heading}deg` }] }}
          >
            <Polygon
              points={arrowPoints
                .map((p) => `${p.x + arrowLength},${p.y + arrowLength}`)
                .join(' ')}
              fill="rgba(0, 122, 255, 0.8)"
              stroke="navy"
              strokeWidth={2}
            />
            <Line
              x1={arrowLength}
              y1={arrowLength}
              x2={arrowLength}
              y2={arrowLength - arrowLength}
              stroke="navy"
              strokeWidth={2}
            />
          </Svg>
        </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
