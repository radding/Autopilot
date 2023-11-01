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
	// int msgSize = sizeof(msg);
	sendMessage(respCode, msg, messageID);
	
	// if (messageID != 0x00)
	// {
	// 	char msg[20];
	// 	sprintf(msg, "responds to:%d", messageID);
	// 	respond(LOG_TRACE, msg);
	// }
	// Serial.write(respCode);
	// btRespond(respCode);
	
	// int msgLen = sizeof(msg) + 4;
	// char size[2];
	// shift(size, msgLen, 2);
	// Serial.write(size, 2);
	// btRespond(size, 2);
	
	// Serial.write(messageID);
	// btRespond(messageID);

	// if (ensureAll)
	// {
	// 	Serial.write(msg, sizeof(msg));
	// 	btRespond(msg, sizeof(msg));
	// }
	// else
	// {
	// 	Serial.write(msg);
	// 	btRespond(msg);
	// }
	// Serial.write(EOL_CHAR);
	// btRespond(EOL_CHAR);
	
	// char msgtoDebug[10];
	// sprintf(msgtoDebug, "len:%d", msgLen);
	// respond(LOG_INFO, msgtoDebug);
}

void respond(Responses respCode, char *msg)
{
	respond(respCode, msg, 0x00, false);
}

void respond(Responses respCode, const __FlashStringHelper *msg)
{
	Serial.write(respCode);
	btRespond(respCode);

	int msgLen = sizeof(msg);
	char size[2];
	shift(size, msgLen, 2);
	Serial.write(size, 2);
	btRespond(size, 2);

	char debugMSG[10];
	sprintf(debugMSG, "len:%d", msgLen);
	respond(LOG_INFO, debugMSG);

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

int sizeOfMsg(byte *bts) {
	byte *temp = bts;
	int len = 0;
	int termination = 0x00;
	while (temp != 0x00) {
		len++;
		temp++;
	}
	return len;
}

void sendBytesOverWire(byte *msg, byte messageID, byte order) {
	int len = strlen(msg);
	char lenMsg[2];
	shift(lenMsg, len, 2);
	

	Serial.write(messageID);
	btRespond(messageID);

	Serial.write((char)0x00);
	btRespond((char) 0x00);
	
	Serial.write(lenMsg, 2);
	btRespond(lenMsg, 2);


	// Serial.write(order);
	// Serial.write(order);
	// Serial.write(0xFF);
	// btRespond(0xFF);
	
	Serial.write((char *)msg);
	btRespond((char *)msg);

	Serial.write(EOL_CHAR);
	btRespond(EOL_CHAR);
}

void sendBytesOverWire(Responses code, byte messageID, byte order) {
	size_t len = 1;
	
	Serial.write(messageID);
	btRespond(messageID);
	
	Serial.write(0x01);
	btRespond(0x01);
	
	char lenMsg[2];
	shift(lenMsg, len, 2);
	Serial.write(lenMsg, 2);
	btRespond(lenMsg, 2);

	// Serial.write(order);
	// Serial.write(order);
	// Serial.write(0xFF);
	// btRespond(0xFF);
	
	Serial.write(code);
	btRespond(code);

	Serial.write(EOL_CHAR);
	btRespond(EOL_CHAR);
}

void sendMessage(Responses respCode, byte *msg, byte messageID) {
	if (messageID == 0x00) {
		messageID = static_cast<byte>(random(0, 127) | 0x80);
	}
	byte terminator[] = {MSG_END};
	sendBytesOverWire(respCode, messageID, 0);
	if (msg != 0x00) {
		sendBytesOverWire(msg, messageID, 1);
	}
	sendBytesOverWire(MSG_END, messageID, 3);
}

void sendMessage(Responses respCode, byte messageID) {
	return sendMessage(respCode, 0x00, messageID);
}

void sendMessage(Responses respCode) {
	return sendMessage(respCode, 0x00);
}