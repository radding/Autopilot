// #include <pb_decode.h>
// #include <pb_encode.h>
// #include <string.h>
// #include "channels.h"

// bool SerialChannel::hasData()
// {
//     return stream->available() > 0;
// }

// _Request Channel::receive()
// {
//     auto buffer = read();
//     auto stream = pb_istream_from_buffer(buffer, sizeof(buffer));
//     _Request msg;
//     if (!pb_decode(&stream, Request_fields, &msg))
//     {
//         PrintContents msg;
//         char contents[30] = "FAILED TO DECODE LAST MESSAGE";
//         msg.lvl = MessageLevel_Error;
//         strncpy(msg.message, contents, sizeof(contents));
//         msg.message[sizeof(contents) + 1] = '\0';
//         _Response resp;

//         resp.messageID = 0;
//         resp.type = ResponseType_Print;
//         resp.message.messageContents = msg;
//         this->send(resp);
//     }
//     return msg;
// }

// void Channel::send(_Response &resp)
// {
//     auto bufferSize = sizeof(resp);
//     uint8_t buffer[bufferSize];
//     pb_ostream_t stream = pb_ostream_from_buffer(buffer, sizeof(buffer));
//     if (pb_encode(&stream, Response_fields, buffer))
//     {
//         this->write(buffer, bufferSize);
//         return;
//     }
// }

// uint8_t *SerialChannel::read()
// {
//     int len = stream->available();
//     uint8_t buff[len + 1];
//     stream->readBytesUntil((char)0x0, buff, len + 1);
//     return buff;
// }

// void SerialChannel::write(uint8_t *buff, size_t len)
// {
//     stream->write(buff, len);
// }

// bool BLEChannel::hasData()
// {
//     return characteristic->canRead();
// }

// uint8_t *BLEChannel::read()
// {
//     return (uint8_t *)characteristic->value();
// }

// void BLEChannel::write(uint8_t *buf, size_t len)
// {
//     characteristic->writeValue(buf, len);
// }

// void Printer::print(char *m, MessageLevel)
// {
//     PrintContents msg;
//     msg.lvl = MessageLevel_Error;
//     strncpy(msg.message, m, sizeof(m));
//     msg.message[sizeof(m) + 1] = '\0';
//     _Response resp;

//     resp.messageID = 0;
//     resp.type = ResponseType_Print;
//     resp.message.messageContents = msg;
//     this->send(resp);
// }