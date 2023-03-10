#include <Arduino.h>
#include <stdio.h>

#include "./Command.h"
#include <SoftwareSerial.h>
#include "./CombinedStream.h"


enum LogLevel {
	ERROR = 0b1000,
	WARN = 0b0100,
	INFO = 0b0010,
	DEBUG = 0b0001,
};

#ifndef LOG_LEVEL
#define LOG_LEVEL INFO | WARN | ERROR
#endif

byte logLevel = LOG_LEVEL;

bool filterRespCode(Responses code) {
	return (code > LOG_WARN || code == HEADING)
		|| (code == LOG_ERROR && logLevel & ERROR) 
		|| (code == LOG_WARN && logLevel & WARN)
		|| (code == LOG_INFO && logLevel & INFO)
		|| (code == LOG_TRACE && logLevel & DEBUG);
}

void btRespond(char *msg) {
	SoftwareSerial *bt = GetBlueTooth();
	if (!bt) {
		return;
	}
	bt->write(msg);
}

void btRespond(const unsigned char &msg) {
	SoftwareSerial *bt = GetBlueTooth();
	if (!bt) {
		return;
	}
	bt->write(msg);
}

void btRespond(char *msg, size_t size) {
	SoftwareSerial *bt = GetBlueTooth();
	if (!bt) {
		respond(LOG_INFO, "No BT Object");
		return;
	}
	bt->write(msg, size);
}

void btRespond(Responses &resp) {
	SoftwareSerial *bt = GetBlueTooth();
	if (!bt) {
		return;
	}
	bt->write(resp);
}

void respond(Responses respCode, char *msg, unsigned char messageID, bool ensureAll)
{
	if (messageID != 0x00)
	{
		char msg[20];
		sprintf(msg, "responds to:%d", messageID);
		respond(LOG_TRACE, msg);
	}
	Serial.write(respCode);
	btRespond(respCode);

	Serial.write(messageID);
	btRespond(messageID);

	if (ensureAll)
	{
		Serial.write(msg, sizeof(msg));
		btRespond(msg, sizeof(msg));
	}
	else
	{
		Serial.write(msg);
		btRespond(msg);
	}
	Serial.write(EOL_CHAR);
	btRespond(EOL_CHAR);
}

void respond(Responses respCode, char *msg)
{
	respond(respCode, msg, 0x00, false);
}

void respond(Responses respCode, const __FlashStringHelper *msg)
{
	Serial.write(respCode);
	btRespond(respCode);
	Serial.write(0x00);
	btRespond((const unsigned char)0x00);
	Serial.print(msg);
	btRespond(msg);
	Serial.write(EOL_CHAR);
	btRespond(EOL_CHAR);
}

void respond(Responses respCode, char *msg, unsigned char messageID)
{
	respond(respCode, msg, messageID, true);
}

void commandFrom(Command *cmd, char *headers)
{
	cmd->command = headers[0];
	cmd->messageID = headers[1];
	cmd->payload = &headers[3];
}