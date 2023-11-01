#ifndef COMMAND_H
#define COMMAND_H

#include <Arduino.h>
#include <SoftwareSerial.h>
#include "./CombinedStream.h"
#include "./converters.h"

const unsigned char EOL_CHAR = '\n';

/**
 * Commands that this device can respond to
 */
enum Commands
{
	/**
	 * Respond with current magnetic bearing
	 */
	GET_BEARING = 0x01,
	/**
	 * Set our desired bearing
	 */
	SET_DESIRED_BEARING = 0x02,
	/**
	 * Calibrate the compass
	 */
	CALIBRATE_COMPASS = 0x03,
	/**
	 * Begin piloting on compass reading
	 */
	BEGIN_PILOT_COMPASS = 0x04,
	/**
	 * Continue to print our bearing
	 */
	CONTINUOS_GET_HEADING = 0x05,

	/**
	 * End piloting by compass
	 */
	END_PILOT_COMPASS = 0x06,

	STOP_SENDING_HEADING = 0x07,

	PING,

	/**
	 * Report how much free memory we have available
	*/
	REPORT_FREE_MEMORY,

	/**
	 * Reboot the processor
	*/
	RESET_UNIT,

	STOP_CALIBRATING,

	CHANGE_NAME,

	STREAM_CALIBRATION_DATA,
	STOP_STREAMING_CALIBRATION_DATA,

	_last,

};

/**
 * Responses this command can send back to master device
 */
enum Responses
{
	/**
	 * The heading from the comapss
	 */
	HEADING = 0x01,
	/**
	 * LOG an error
	 */
	LOG_ERROR = 0x02,
	/**
	 * A fatal unrecoverable error
	 */
	FATAL = 0x03,
	/**
	 * Log info
	 */
	LOG_INFO = 0x04,
	/**
	 * Log trace information
	 */
	LOG_TRACE = 0x05,
	/**
	 * Log warning information
	 */
	LOG_WARN = 0x06,
	/**
	 * The previous command was unrecognized
	 */
	UNRECOGNIZED_COMMAND = 0x07,

	/**
	 * The previous command was acknowledged
	 */
	ACK = 0x08,

	/**
	 * Module is ready
	 */
	MODULE_READY = 0x09,

	/**
	 * Send a heartbeat over serial
	 */
	PONG = 0x0A,

	/**
	 * Respond with the memory available
	*/
	FREE_MEMORY = 0x0B,

	/**
	 * The desired heading was not set
	 */
	ERR_NO_DESIRED_HEADING = 0x0B,

	CALIBRATION_DONE,

	ERR_IS_CALIBRATING,

	CALIBRATION_DATA,

	MSG_END,
	
	NAME_CHANGED,


};

typedef struct Command
{
	Commands command;
	Stream *source;
	unsigned char messageID;
	unsigned char *payload;
} Command;

// typedef struct Response
// {
// 	Responses resp;
// 	char *payload;
// } Response;

void respond(Responses respCode, char *msg);
void respond(Responses respCode, const __FlashStringHelper *msg);
void respond(Responses respCode, char *msg, unsigned char messageID);

void sendMessage(Responses respCode, byte *msg, byte messageID);
void sendMessage(Responses respCode, byte messageID);
void sendMessage(Responses respCode);


void commandFrom(Command *cmd, char *headers);

template <class T> int respondWithAnything(Responses respCode, const T& value, byte messageID)
{
	SoftwareSerial *bt = GetBlueTooth();
	  
  	const byte* p = (const byte*)(const void*)&value;
  	Serial.write(respCode);

	if (bt) {
		bt->write(respCode);
	}

	int msgLen = sizeof(p);
	char size[2];
	shift(size, msgLen, 2);
	Serial.write(size, 2);
	if (bt) {
		bt->write(size, 2);
	}

  	Serial.write(messageID);
	if (bt) {
		bt->write(messageID);
	}

  	unsigned int i;
  	for (i = 0; i < sizeof(value); i++) {
		if (bt) {
			bt->write(*p++);
		}
		Serial.write(*p++);
  	}

	Serial.write(EOL_CHAR);
	if (bt) {
		bt->write(EOL_CHAR);
	}

	return i;
}

template <class T> int convertFromAnything(byte* ee, T& value)
{
    byte* p = (byte*)(void*)&value;
    unsigned int i;
    for (i = 0; i < sizeof(value); i++)
          *p++ = *ee++;
    return i;
}

#endif