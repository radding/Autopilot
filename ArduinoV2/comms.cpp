// #include <Stream.h>
// #include <ArduinoBLE.h>
// #include "comms.h"
// #include "channels.h"

// Communication::Communication(BLECharacteristic *chars[], BLEService *service, Stream *stream)
// {
//     this->service = service;
//     this->stream = stream;
//     this->characteristics = chars;
//     this->serialChannel = new SerialChannel(stream);
//     this->printChannel = new Printer(stream);
//     // BufferedReadChannel read(nullptr, 0);
//     // SerialCommsChannel printChan(read, Serial, 0x00, PRINT);
//     // printChannel = printChan;

//     // Handler handlers[NUMBER_OF_ELEMENTS];
//     // this->handlers = handlers;
// }

// void Communication::addHandler(const Actions &act, Handler &fn)
// {
//     BLECharacteristic *characteristic = characteristics[act];
//     characteristicUUIDToAction[characteristic->uuid()] = act;
//     // this.
//     // auto handler = [&fn](BLEDevice central, BLECharacteristic characteristic)
//     // {
//     //   c
//     //   auto channel = BLEChannel(&characteristic);
//     //   fn(channel);
//     // };
//     // typedef decltype(capture) CaptureLambdaType;
//     // typedef void(CaptureLambdaType::*CaptureFuncType)(BLEDevice central, BLECharacteristic characteristic) const;
//     // CaptureFuncType captureLambda = &CaptureLambdaType::operator();

//     // characteristic->setEventHandler(BLEWritten | BLERead, handler.*captureLambda);
//     handlers[act] = fn;
// }

// void Communication::handle(const Actions &act, const Channel &chan)
// {
//     auto handler = handlers[act];
//     if (handler == nullptr)
//     {
//         return;
//     }
//     handler(chan);
// }

// void Communication::handle(const Actions &act, BLECharacteristic &characteristic)
// {
//     auto channel = BLEChannel(&characteristic);
//     handle(act, channel);
// }

// void Communication::handle()
// {
//     if (stream->available() <= 0)
//     {
//         return;
//     }
//     printChannel->debug("got serial input");
//     auto msg = serialChannel->receive();
//     Serial.println(msg.type);
// }
