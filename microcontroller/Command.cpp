#include <Arduino.h>
#include <stdio.h>

#include "./Command.h"

void respond(Responses respCode, char *msg, unsigned char messageID, bool ensureAll)
{
	if (messageID != 0x00)
	{
		char msg[20];
		sprintf(msg, "responds to:%d", messageID);
		respond(LOG_TRACE, msg);
	}
	Serial.write(respCode);
	Serial.write(messageID);
	if (ensureAll)
	{
		Serial.write(msg, sizeof(msg));
	}
	else
	{
		Serial.write(msg);
	}
	Serial.write(EOL_CHAR);
}

void respond(Responses respCode, char *msg)
{
	respond(respCode, msg, 0x00, false);
}

void respond(Responses respCode, const __FlashStringHelper *msg)
{
	Serial.write(respCode);
	Serial.write(0x00);
	Serial.print(msg);
	Serial.write(EOL_CHAR);
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