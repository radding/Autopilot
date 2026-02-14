// #pragma once

#define PB_PROTO_HEADER_VERSION 40

// #include <stdbool.h>
// #include <Arduino.h>
// #include <Stream.h>
// #include <ArduinoBLE.h>
// #include "service.pb.h"
// #include "Actions.h"

// typedef unsigned char uint8_t;
// pb_istream_t pb_istream_from_buffer(const pb_byte_t *buf, size_t msglen);

// class Channel
// {
// private:
// public:
//     virtual bool hasData() {};
//     virtual uint8_t *read() {};
//     _Request receive();

//     void send(_Response &resp);
//     virtual void write(uint8_t *raw, size_t len) {};
//     Channel() {};
//     ~Channel() {};
// };

// class SerialChannel : public Channel
// {
// private:
//     Stream *stream;

// public:
//     SerialChannel(Stream *s)
//     {
//         stream = s;
//     }
//     bool hasData();
//     uint8_t *read();
//     void write(uint8_t *raw, size_t len);
// };

// class BLEChannel : public Channel
// {
// private:
//     BLECharacteristic *characteristic;

// public:
//     BLEChannel(BLECharacteristic *c) { characteristic = c; }
//     bool hasData();
//     uint8_t *read();
//     void write(uint8_t *raw, size_t len);
// };

// class Printer : public SerialChannel
// {
// public:
//     Printer(Stream *s) : SerialChannel(s) {}
//     void print(char *msg, MessageLevel lvl);
//     void info(char *msg) { print(msg, MessageLevel_Info); };
//     void error(char *msg) { print(msg, MessageLevel_Error); };
//     void warn(char *msg) { print(msg, MessageLevel_Warn); };
//     void debug(char *msg) { print(msg, MessageLevel_Debug); };
//     void trace(char *msg) { print(msg, MessageLevel_Trace); };
// };
