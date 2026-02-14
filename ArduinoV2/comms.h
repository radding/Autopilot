#pragma once
// #include <ArduinoBLE.h>
// #include <functional>
// #include <map>
// #include "channels.h"
// #include "Actions.h"

// enum CharacteristicType
// {
//     BYTE,
//     CHAR,
//     STRING,
//     FLOAT,
//     UNSIGNED_CHAR,
//     RAW,
// };

// typedef void (*Handler)(const Channel &);

// // class BLEHandlerWrapper {
// // private:
// //   Handler handler;
// // public:
// //   BLEHandlerWrapper(Handler hndler) { handler = hndler; }
// //   void handle
// // };

// class Communication
// {
// private:
//     BLEService *service;
//     BLECharacteristic **characteristics;
//     Stream *stream;
//     Handler handlers[NUMBER_OF_ELEMENTS];
//     std::map<const char *, Actions> characteristicUUIDToAction;
//     Printer *printChannel;
//     SerialChannel *serialChannel;

// public:
//     Communication(BLECharacteristic *chars[], BLEService *service, Stream *stream);

//     void addHandler(const Actions &act, Handler &fn);
//     void handle();
//     void handle(const Actions &act, BLECharacteristic &characteristic);
//     void handle(const Actions &act, const Channel &chan);

//     Actions getActionForBLE(const char *uuid)
//     {
//         return characteristicUUIDToAction[uuid];
//     }

//     ~Communication()
//     {
//         delete printChannel;
//         delete serialChannel;
//     }
//     // void setup();
// };
