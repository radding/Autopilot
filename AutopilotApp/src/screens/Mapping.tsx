import { useState } from "react";
import { View, Text, Dimensions, Platform } from "react-native";
import MapView, { UrlTile } from "react-native-maps";

const tileURL =
  "https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer/WMTS/tile/1.0.0/MarineChart_Services_NOAACharts/default/GoogleMapsCompatible/{z}/{y}/{x}.png";

const tile2URL = `https://gaiavectortilerendering.global.ssl.fastly.net/noaa-enc/{z}/{x}/{y}.png`;
const tile3URL = `https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer/WMTS/tile/1.0.0/MarineChart_Services_NOAACharts/default/default028mm/{z}/{y}/{x}.png`;

export const Mapping = () => {
  const [size, setSize] = useState({
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  });
  const [region, setRegion] = useState({
    latitude: 42.587631,
    longitude: -82.818542,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  return (
    <View>
      <MapView
        provider="google"
        style={{
          width: size.width,
          height: size.height,
        }}
        loadingEnabled={true}
        // mapType={Platform.select({ android: "none", ios: "standard" })}
        maxZoomLevel={18}
        minZoomLevel={5}
        pitchEnabled={false}
        rotateEnabled={false}
        showsBuildings={false}
        showsCompass={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsScale={false}
        toolbarEnabled={false}
        region={region}
      >
        <UrlTile
          minimumZ={3}
          zIndex={1}
          tileSize={256}
          urlTemplate={tile3URL}
          shouldReplaceMapContent
        />
      </MapView>
    </View>
  );
};
