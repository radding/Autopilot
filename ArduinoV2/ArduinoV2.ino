#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h>

#include "vector3d.h";
#include "eeprom.h";

const unsigned char HAS_COMPASS = 1;
const unsigned char HAS_GPS = HAS_COMPASS << 1;
const unsigned char HAS_WIND = HAS_GPS << 1;

unsigned char capabilities = HAS_COMPASS;

const int NAME_ADDR = 0;

bool isCalibrating = false;
unsigned int targetHeading = -1;
unsigned int targetWindAngle = -1;
bool acceptOrReject = true;


const char* compassServiceUUID = "f23bdd1c-a520-457b-8ea9-4aeaa7045938";
const char* headingCharacteristicUUID = "5a38993b-46a5-445b-b5e7-2dd28c6e36e6";
const char* headToCharacteristicUUID = "5a08ca75-a2b8-4bd0-a85d-969743ea779b";
const char* calibrateCharacteristicUUID = "fb21442b-1ca7-4e49-9c3a-1bc759ebd737";
const char* calibrateDoneCharacteristicUUID = "fc910e66-9153-4d5c-ba23-c3827de79b75";
const char* changeNameCharacteristicUUID = "aa7f789e-7aa6-48da-b867-77fcfa5c4ce9";
const char* getCapabilitiesCharactisticsUUID ="daab669f-cf77-45f2-9202-0c893b0d9215";
const char* setPinCharacteristicUUID = "9ae4fa3d-ff6c-43d9-99a1-e8ab00bbce85";
const char *setWindAngleCharacteristicUUID = "7ac83d4f-f70c-406f-b52d-653a101e15c0";
const char *windAngleCharacteristicUUID = "2f370ac1-4374-4c51-b978-98f466be3461";

BLEService compassService(compassServiceUUID);
BLEFloatCharacteristic headingCharacteristic(headingCharacteristicUUID, BLEWrite | BLERead);
BLEFloatCharacteristic headToCharacteristic(headToCharacteristicUUID, BLEWrite | BLERead);
BLEByteCharacteristic startCalibrateCharacteristic(calibrateCharacteristicUUID, BLEWrite | BLERead);
BLEByteCharacteristic calibrateStatusCharacteristic(calibrateDoneCharacteristicUUID, BLEWrite | BLERead);
BLEStringCharacteristic changeNameCharacteristic(changeNameCharacteristicUUID, BLEWrite | BLERead, 255);
BLEByteCharacteristic getCapabilitesCharacteristics(getCapabilitiesCharactisticsUUID, BLEWrite | BLERead);
BLEFloatCharacteristic setWindAngleCharacteristic(setWindAngleCharacteristicUUID, BLEWrite | BLERead);
BLEFloatCharacteristic getWindAngleCharacteristic(windAngleCharacteristicUUID, BLEWrite | BLERead);

BLEUnsignedCharCharacteristic secretValue("2a3F", BLERead | BLEWrite | BLEEncryption);

void setup() {
  Serial.begin(9600);

  Serial.println("Started device");

  auto name = readFromEEPROM(NAME_ADDR);

  BLE.setLocalName(name);
  BLE.setDeviceName(name);

  if (!BLE.begin()) {
    Serial.println("* Starting Bluetooth® Low Energy module failed!");
    while (1);
  }
  
  BLE.setAdvertisedService(compassService);
  compassService.addCharacteristic(headingCharacteristic);
  compassService.addCharacteristic(headToCharacteristic);
  compassService.addCharacteristic(startCalibrateCharacteristic);
  compassService.addCharacteristic(calibrateStatusCharacteristic);
  compassService.addCharacteristic(secretValue);
  compassService.addCharacteristic(changeNameCharacteristic);
  compassService.addCharacteristic(getCapabilitesCharacteristics);
  compassService.addCharacteristic(setWindAngleCharacteristic);
  compassService.addCharacteristic(getWindAngleCharacteristic);

  BLE.addService(compassService);
  BLE.advertise();
  headingCharacteristic.writeValue(-1);
  int resp = IMU.begin();
  IMU.setContinuousMode();
  if (!resp) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  } else {
    char respCode[30];
    sprintf(respCode, "got %d when IMU initialized", resp);
    Serial.println(respCode);
  }

  changeNameCharacteristic.setEventHandler(BLEWritten, changeName);
  getCapabilities.setEventHandler(BLERead, getCapabilities);
}

unsigned int getHeading() {
  float magX, magY, magZ;
  float accelX, accelY, accelZ;

  // if (IMU.magneticFieldAvailable()) {
  int val = IMU.readMagneticField(magX, magY, magZ);
  char respCode[30];
  // sprintf(respCode, "got %d from reading IMU", val);
  // Serial.println(respCode);
  // } else {
    // Serial.println("Can not read from magnetic field");
  // }

  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(accelX, accelY, accelZ);
  } else {
    // Serial.println("Can't read accel data");
  }

  Vector3D magVec(magX, magY, magZ);
  // magVec.x = magX;
  Vector3D accelVec(accelX, accelY, accelZ);

  float h = calculateHeading(accelVec, magVec);
  // Serial.println("Current Heading:");
  // Serial.println(h, 3);
  return h;
}

void loop() {
  BLEDevice central = BLE.central();
  BLE.setPairable(Pairable::YES);

  if (central) {
    Serial.println("* Connected to central device!");
    Serial.print("* Device MAC address: ");
    Serial.println(central.address());
    Serial.println(" ");
    

    while (central.connected()) {
      // if (changeNameCharacteristic.written()) {
      //   Serial.println("getting change name");
      //   changeName();
      // }
      // if (headToCharacteristic.written()) {
      //   Serial.println("Getting a new heading");
      // }
      // auto heading = getHeading();
      // headingCharacteristic.writeValueLE(heading);
    }
    
    Serial.println("* Disconnected to central device!");
  }
}

void changeName(BLEDevice central, BLECharacteristic characteristic) {
    String value = changeNameCharacteristic.value();
    Serial.println("new name:");
    Serial.println(value);
    return;
    writeStringToEEPROM(NAME_ADDR, value);
}

void getCapabilities(BLEDevice central, BLECharacteristic characteristic) {
  characteristic.writeValue(capabilities);
}