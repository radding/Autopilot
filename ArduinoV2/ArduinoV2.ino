// #include <ArduinoBLE.h>
// #include <Arduino_LSM9DS1.h>

#include <Arduino.h>
#include <pb_encode.h>
#include <pb_decode.h>
#include "pb_arduino.h"
#include "service.pb.h"
#include "eeprom.h"
#include <Preferences.h>
#include <Adafruit_GPS.h>
#include <ArduinoBLE.h>
#include <FastIMU.h>
#include <Wire.h>
#include "Madgwick.h"
#include "statemanagement.h"
#include "communication.h"
#define IMU_ADDRESS 0x68

Preferences prefs;
uint32_t timer = millis();
MPU9255 IMU;

BLEService compassService("f23bdd1c-a520-457b-8ea9-4aeaa7045938");
BLECharacteristic characteristic("20822af1-4c2b-4157-b629-6f59d52d7f29", BLERead | BLENotify | BLEBroadcast | BLEWrite, 2048);

const unsigned char HAS_COMPASS = 1;
const unsigned char HAS_GPS = HAS_COMPASS << 1;
const unsigned char HAS_WIND = HAS_GPS << 1;

unsigned char CAPABILITES = 0;
char name[255] = "Autopilot";

pb_istream_s pb_in = as_pb_istream(Serial);
// pb_ostream_s pb_out = as_pb_ostream(Serial);

Adafruit_GPS GPS(&Serial1);
uint32_t streamID = 0;
bool is_streaming = false;
uint32_t stream_refresh_rate = 1000;
double targetHeading = -1;
float magneticCourse = -1;
calData calib = {0}; //

const int I2C_SDA = 11;
const int I2C_SCL = 12;

Madgwick filter;

void loop()
{
  if (CAPABILITES & HAS_COMPASS)
  {
    AccelData IMUAccel; // Sensor data
    GyroData IMUGyro;
    MagData IMUMag;

    IMU.update();
    IMU.getAccel(&IMUAccel);
    IMU.getGyro(&IMUGyro);
    IMU.getMag(&IMUMag);
    filter.update(IMUGyro.gyroX, IMUGyro.gyroY, IMUGyro.gyroZ, IMUAccel.accelX, IMUAccel.accelY, IMUAccel.accelZ, IMUMag.magX, IMUMag.magY, IMUMag.magZ);
    float yaw = atan2(2.0f * (filter.getQuatY() * filter.getQuatZ() + filter.getQuatW() * filter.getQuatX()), filter.getQuatW() * filter.getQuatW() + filter.getQuatX() * filter.getQuatX() - filter.getQuatY() * filter.getQuatY() - filter.getQuatZ() * filter.getQuatZ());

    float heading = yaw * (180.0f / (float)PI);
    if (heading < 0)
    {
      heading = 360 + heading;
    }
    else if (heading > 360)
    {
      heading = heading - 360;
    }
    magneticCourse = heading;
  }
  // do everthing before we check for commands!
  char c = GPS.read();
  if (c && !(CAPABILITES & HAS_GPS))
  {
    CAPABILITES |= HAS_GPS;
  }
  if (GPS.newNMEAreceived())
  {
    if (!GPS.parse(GPS.lastNMEA()))
    {
    }
  }
  // auto should_refresh_stream = (millis() - timer) > stream_refresh_rate;
  bool should_refresh_stream = true;
  if (is_streaming && should_refresh_stream)
  {
    timer = millis();
    streamData();
  }

  if (Serial.available() > 0)
  {
    Request request;
    auto status = pb_decode(&pb_in, Request_fields, &request);
    if (status != 0)
    {
      // Serial.write(ResponseType::ERROR);
      return;
    }
    handleRequest(request);
  }
  // Stream data
}

void handleRequest(Request request)
{
  Response response;
  response.messageID = request.messageID;
  response.streamID = request.streamID;
  switch (request.type)
  {
  case RequestType::RequestType_IDENTIFY:
    handleIdentify(request, response);
    break;
  case RequestType::RequestType_GET_CAPABILITIES:
    handleCapabilities(request, response);
    break;
  case RequestType::RequestType_CHANGE_NAME:
    handleChangeName(request, response);
    break;
  case RequestType::RequestType_GET_DATA:
    handleGetData(request, response);
    break;
  case RequestType::RequestType_STREAM_DATA:
    handleStreamData(request, response);
    return;
  case RequestType::RequestType_HEAD_TO_HEADING:
    handleHeadToHeading(request, response);
    break;
  case RequestType::RequestType_STOP_STREAM:
    // handleStopStream(request, response);
    break;
  case RequestType::RequestType_CALIBRATE:
    handleCalibrate(request, response);
    break;
  default:
    // Serial.write(ResponseType::ERROR);
    break;
  }
  sendResponse(response);
}

void streamData()
{
  Response response;
  Request request;
  response.streamID = streamID;
  response.messageID = streamID;
  handleGetData(request, response);
  sendResponse(response);
}

// void sendResponse(Response response)
// {
//   pb_encode_ex(&pb_out, Response_fields, &response, PB_ENCODE_DELIMITED);
// }

void handleStreamData(Request request, Response &response)
{
  streamID = request.streamID;
  is_streaming = true;
  stream_refresh_rate = request.message.streamDataRequest.streamRefreshRate;
  response.type = ResponseType::ResponseType_Pong;
  response.which_message = Response_empty_tag;
  response.message.empty = Empty_init_zero;
}

void handleHeadToHeading(Request request, Response &response)
{
  response.type = ResponseType::ResponseType_Pong;
  response.which_message = Response_empty_tag;
  response.message.empty = Empty_init_zero;
  targetHeading = request.message.heading.heading;
}

void handleCalibrate(Request request, Response &response)
{
  response.type = ResponseType::ResponseType_CALIBRATE_FINISHED;
  response.which_message = Response_empty_tag;
  streamID = request.streamID;
  is_streaming = true;
  setState(AutopilotState_Calibrating);
  calibrate(NULL);
  response.message.empty = Empty_init_zero;
}

void calibrate(void *h)
{
  if (CAPABILITES & HAS_COMPASS)
  {
    IMU.calibrateAccelGyro(&calib);
    IMU.calibrateMag(&calib);
  }
  setState(AutopilotState_Standby);
  is_streaming = false;
  streamID = 0;
  // vTaskDelete(NULL);
}

void handleCalibrateEnd(Request request, Response &response)
{
  response.type = ResponseType::ResponseType_Pong;
  response.which_message = Response_empty_tag;
  response.message.empty = Empty_init_zero;
}

void handleIdentify(Request request, Response &response)
{
  IdentifyResponse idResponse = IdentifyResponse_init_zero;

  strcpy(idResponse.name, name);
  strcpy(idResponse.version, "1.0.0");
  strcpy(idResponse.serialNumber, "1234567890");
  strcpy(idResponse.firmwareVersion, "0.0.2");
  response.type = ResponseType::ResponseType_IdentifyResult;
  response.which_message = Response_identify_tag;
  response.message.identify = idResponse;
}

void handleCapabilities(Request request, Response &response)
{
  GetCapabilitesResponse capabilities;
  capabilities.wind = CAPABILITES & HAS_WIND;
  capabilities.magnetic = CAPABILITES & HAS_COMPASS;
  capabilities.gps = CAPABILITES & HAS_GPS;
  capabilities.freeMemory = ESP.getFreeHeap();
  getState(capabilities.state);

  response.type = ResponseType::ResponseType_CapabilitesResult;
  response.which_message = Response_Capabilites_tag;
  response.message.Capabilites = capabilities;
}

void handleChangeName(Request request, Response &response)
{
  Empty changeNameResponse = Empty_init_zero;
  strcpy(name, request.message.nameChange.name);
  prefs.putString("name", name);
  response.type = ResponseType::ResponseType_Pong;
  response.which_message = Response_empty_tag;
  response.message.empty = changeNameResponse;
}

void handleGetData(Request request, Response &response)
{
  DeviceData device_data = DeviceData_init_zero;
  device_data.hasGPSFix = GPS.fix;
  device_data.latitude = GPS.latitudeDegrees;
  device_data.has_latitude = GPS.fix;
  device_data.longitude = GPS.longitudeDegrees;
  device_data.has_longitude = GPS.fix;
  device_data.speedOverGround = GPS.speed;
  device_data.has_speedOverGround = GPS.fix;
  device_data.courseOverGround = GPS.angle;
  device_data.has_courseOverGround = GPS.fix;
  device_data.magneticCourse = magneticCourse;
  device_data.has_magneticCourse = magneticCourse != -1 && CAPABILITES & HAS_COMPASS;
  device_data.windAngle = 0;
  device_data.piloting = false;
  device_data.targetHeading = 0;
  response.type = ResponseType::ResponseType_DataResult;
  response.which_message = Response_data_tag;
  response.message.data = device_data;
}

void setup()
{
  Serial.begin(9600);
  initState();
  initCommunication();
  Serial1.begin(9600, SERIAL_8N1, D5, D4);
  prefs.begin("autopilot");
  String defaultName = "Autopilot";
  auto tempName = prefs.getString("name", defaultName);
  strcpy(name, tempName.c_str());

  // Set up GPS
  GPS.begin(9600);
  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA);
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
  GPS.sendCommand(PGCMD_ANTENNA);
  delay(1000);
  // Ask for firmware version
  Serial1.println(PMTK_Q_RELEASE);

  Wire.begin();
  Wire.setClock(400000);

  int err = IMU.init(calib, IMU_ADDRESS);
  if (err == 0)
  {
    CAPABILITES |= HAS_COMPASS;
  }

  // BLE.setLocalName(name);
  // BLE.setDeviceName(name);
  // if (!BLE.begin())
  // {
  //   Serial.println("Failed to initialize BLE");
  // }
  // BLE.setAdvertisedService(compassService);
  // compassService.addCharacteristic(characteristic);
  // BLE.advertise();
  // characteristic.setEventHandler(BLEWritten, onBLEWritten);
}

void onBLEWritten(BLEDevice central, BLECharacteristic characteristic)
{
  // uint8_t value[2048];
  // characteristic.readValue(value, 2048);
  // pb_istream_t pb_in_bt = as_pb_istream(value);
  // Request request;
  // auto status = pb_decode(&pb_in_bt, Request_fields, &request);

  // if (status != 0)
  // {
  //   return;
  // }
}
