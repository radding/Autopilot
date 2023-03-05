#include <QMC5883LCompass.h>
#include <stdio.h>
#include <Stepper.h>
#include <SoftwareSerial.h>

#include "statemachine.h"
#include "Command.h"
#include "commandHandler.h"
#include "converters.h"
#include "pid.h"
#include "CombinedStream.h"

#define RX_PIN 2
#define TX_PIN 3

QMC5883LCompass compass;

// PILOT SHIT
ArduPID pilot;
double setpoint = 0;
double input;
double output;
double p = .5;
double i = 1;
double d = 0;

handlerFn handlers[9];

CommandHandler handler(handlers);

volatile State state = INIT;
bool keepSendingHeading = false;
bool piloting = false;
volatile int desired_heading = -1;
volatile char streamID = -1;

volatile char headers[12];
volatile short readBytes;

// Stepper motor stuff
const int stepsPerRevolution = 200;
Stepper myStepper = Stepper(stepsPerRevolution, 7, 6, 5, 4);

SoftwareSerial bluetoothSerial(RX_PIN, TX_PIN);

void setup()
{
	Serial.begin(9600);
	bluetoothSerial.begin(9600);
	SetBlueTooth(bluetoothSerial);

	Wire.begin();
	compass.init();

	// TODO: Set in eeprom
	compass.setCalibration(-157, 382, -1595, 0, -395, 0);
	compass.setSmoothing(10, true);
	pilot.begin(&input, &output, &setpoint, p, i, d);

	pilot.setOutputLimits(-360, 360);
	pilot.setWindUpLimits(-10, 10);

	handler.addHandler(BEGIN_PILOT_COMPASS, &pilotCompass);
	handler.addHandler(END_PILOT_COMPASS, &endPilotCompass);
	handler.addHandler(GET_BEARING, &getBearingCommand);
	handler.addHandler(SET_DESIRED_BEARING, &setDesiredBearingCommand);
	handler.addHandler(CONTINUOS_GET_HEADING, &contiousHeadingCommand);
	handler.addHandler(STOP_SENDING_HEADING, &stopContinousHeadingCommand);
	handler.addHandler(PING, &pingCommand);

	myStepper.setSpeed(100);

	respond(MODULE_READY, (char *)0x00);
}

int getCompassHeading()
{
	return compass.getAzimuth();
}

void loop()
{

	if (bluetoothSerial.available()) {
		
		readSerial(bluetoothSerial);
		return; // Ensure that we only handle reading
	}
	compass.read();
	input = (double)getCompassHeading();
	pilot.compute();
	char msg[22];
	char fMsg[10];
	if (keepSendingHeading)
	{
		int heading = getCompassHeading();
		char msg[2];
		shift(msg, heading, 2);
		respond(HEADING, msg, streamID);
	}
	if (piloting)
	{
		dtostrf(output, 1, 2, fMsg);
		sprintf(msg, "adjustto:%s", fMsg);
		respond(LOG_TRACE, msg);
		myStepper.step(output);
	}
}

void serialEvent()
{
	readSerial(Serial);
}

void readSerial(Stream &serial) {
	while (serial.available())
	{
		char bt = serial.read();
		char msg[10];
		sprintf(msg, "bts:%02X", bt);
		respond(LOG_INFO, msg);

		headers[readBytes++] = bt;
		if (bt == EOL_CHAR)
		{
			respond(LOG_INFO, headers);
			readBytes = 0;
			handleCommand();
		}
	}

}

void endPilotCompass(const Command &command)
{
	piloting = false;
	pilot.stop();
}

void getBearingCommand(const Command &command)
{
	char res[3];
	memset(res, 1, sizeof(res));
	int compassHeading = getCompassHeading();
	shift(res, compassHeading, 2);
	respond(HEADING, res, command.messageID);
}

void setDesiredBearingCommand(const Command &command)
{
	char msg[25];
	int desiredHeading;
	desiredHeading = command.payload[0] << 8;
	desiredHeading = desiredHeading | command.payload[1];
	sprintf(msg, "desired:%d", desiredHeading);
	respond(LOG_TRACE, msg);
	desired_heading = desiredHeading;
	setpoint = (double)desired_heading;
	respond(ACK, 0x00, command.messageID);
}

void contiousHeadingCommand(const Command &command)
{
	keepSendingHeading = true;
	streamID = command.messageID;
	respond(ACK, 0x00, command.messageID);
}

void stopContinousHeadingCommand(const Command &command)
{
	keepSendingHeading = false;
	streamID = -1;
	respond(ACK, 0x00, command.messageID);
}

void pingCommand(const Command &command)
{
	respond(ACK, 0x00, command.messageID);
}

void handleCommand()
{
	Command command;
	commandFrom(&command, headers);
	handler.broker(command);
	memset(headers, 0, sizeof(headers));
}

void pilotCompass(Command command)
{
	char msg[25];
	sprintf(msg, "cmdCode:%x", command.command);
	respond(LOG_TRACE, msg);
	respond(LOG_TRACE, "got begin command");
	if (desired_heading < 0)
	{
		respond(ERR_NO_DESIRED_HEADING, 0x00, command.messageID);
		return;
	}
	piloting = true;
	pilot.start();
	respond(ACK, 0x00, command.messageID);
};
