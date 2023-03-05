#ifndef COMMAND_H
#define COMMAND_H

#include <Arduino.h>

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
	 * The desired heading was not set
	 */
	ERR_NO_DESIRED_HEADING = 0x0B,

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


void commandFrom(Command *cmd, char *headers);

#endif