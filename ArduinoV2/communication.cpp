#include "communication.h"
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
#include <FreeRTOS.h>
#include <semphr.h>

pb_ostream_s pb_out = as_pb_ostream(Serial);
SemaphoreHandle_t xMutex_out;

void initCommunication()
{
    // xMutex_out = xSemaphoreCreateMutex();
}

void sendResponse(Response response)
{
    // if (xSemaphoreTake(xMutex_out, portMAX_DELAY) == pdTRUE)
    // {
    pb_encode_ex(&pb_out, Response_fields, &response, PB_ENCODE_DELIMITED);
    // xSemaphoreGive(xMutex_out);
    // }
}