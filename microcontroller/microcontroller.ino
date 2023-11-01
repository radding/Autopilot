#include <MPU9250_WE.h>
#include <stdio.h>
#include <Stepper.h>
#include <SoftwareSerial.h>

#include "Compass.h"
#include "statemachine.h"
#include "Command.h"
#include "commandHandler.h"
#include "converters.h"
#include "pid.h"
#include "CombinedStream.h"
#include "MemoryFree.h"
#include "eeprom.h"
#ifdef USE_MPU9250_WE
#include "MPU9250Compass.h"
#endif

#define RX_PIN 2
#define TX_PIN 3
#define EEPROM_CALIB_DATA_START_ADDR 0

//Compass information
// MPU9250_WE compass = MPU9250_WE(MPU9250_ADDR);
#ifdef USE_MPU9250_WE
MPU9250Compass compass; 
#else 
	Compass compass;
#endif

// QMC5883LCompass compass;
// Calibrator *calib;


// PILOT SHIT
ArduPID pilot;
double setpoint = 0;
double input;
double output;
double p = .5;
double i = 1;
double d = 0;

void(* resetFunc) (void) = 0;

bool keepSendingHeading = false;
bool piloting = false;
bool isCalibrating = false;
volatile int desired_heading = -1;
volatile char streamID = -1;

volatile char headers[30];
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
	// if (compass == 0x00) {
		// respond(FATAL, "Compass is nil");
	// }
	compass.initialize();

	pilot.begin(&input, &output, &setpoint, p, i, d);

	pilot.setOutputLimits(-360, 360);
	pilot.setWindUpLimits(-10, 10);

	myStepper.setSpeed(100);

	respond(MODULE_READY, (char *)0x00);
}

float getCompassHeading()
{
	return compass.getHeading();
}

void loop()
{
	compass.read();
	if (bluetoothSerial.available()) {
		readSerial(bluetoothSerial);
		return; // Ensure that we only handle reading
	}
	input = (double)getCompassHeading();
	pilot.compute();
	char msg[22];
	char fMsg[10];
	if (isCalibrating) {
		struct {
			Vector3D mag;
			Vector3D accel;
			Vector3D gyro;
		} CalibrationData;

		CalibrationData.mag = compass.getMag();
		CalibrationData.accel = compass.getAccel();
		CalibrationData.gyro = compass.getGyro();
		respondWithAnything(CALIBRATION_DATA, CalibrationData, streamID);
		// calib->calibrate();
		// respond(LOG_INFO, "calibrating!");
		// if (calib->getIsDone()) {
		// 	char msg[60];
		// 	sprintf(
		// 		msg,
		// 		"data:[[%d,%d],[%d,%d],[%d,%d]]",
		// 		calib->calibrationData[0][0],
		// 		calib->calibrationData[0][1],
		// 		calib->calibrationData[1][0],
		// 		calib->calibrationData[1][1],
		// 		calib->calibrationData[2][0],
		// 		calib->calibrationData[2][1]
		// 	);
		// 	respond(LOG_INFO, msg);

		// 	saveInEeprom(EEPROM_CALIB_DATA_START_ADDR, calib->calibrationData);
		// 	respond(CALIBRATION_DONE, 0x00, streamID);
		// 	delay(100);
		// 	stopCalibration();
		// }
		return;
	}
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
	int compassHeading = static_cast<int>(getCompassHeading());
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
	if (isCalibrating && command.command != STOP_CALIBRATING) {
		respond(ERR_IS_CALIBRATING, 0x00, command.command);
		return;
	}
	switch (command.command)
	{
	case BEGIN_PILOT_COMPASS:
		pilotCompass(command);
		break;
	case END_PILOT_COMPASS:
		endPilotCompass(command);
		break;
	case GET_BEARING:
		getBearingCommand(command);
		break;
	case SET_DESIRED_BEARING:
		setDesiredBearingCommand(command);
		break;
	case CONTINUOS_GET_HEADING:
		contiousHeadingCommand(command);
		break;
	case STOP_SENDING_HEADING:
		stopContinousHeadingCommand(command);
		break;
	case PING:
		pingCommand(command);
		break;
	case REPORT_FREE_MEMORY:
		handleFreeMemoryRequest(command);
		break;
	case RESET_UNIT:
	  	respond(ACK, 0x00, command.messageID);
		delay(200);
	 	resetProcessor();
		break;
	case CALIBRATE_COMPASS:
		// isCalibrating = true; // Don't ack the message
		// calib = new Calibrator(compass);
		streamID = command.messageID;
		break;
	case STOP_CALIBRATING:
		stopCalibration();
		respond(ACK, 0x00, command.messageID);
	case CHANGE_NAME:
		changeBluetoothDeviceName(command);
		break;
	case STREAM_CALIBRATION_DATA:
		streamID = command.messageID;
		isCalibrating = true;
		break;
	case STOP_STREAMING_CALIBRATION_DATA:
		isCalibrating = false;
		streamID = -1;
	default:
		char msg[30];
		sprintf(
			msg,
			"handler not found:%d",
			command.command
		);
		respond(LOG_WARN, msg);
		respond(UNRECOGNIZED_COMMAND, 0x00, command.messageID);
		break;
	}
	// handler.broker(command);
	memset(headers, 0, sizeof(headers));
}

void stopCalibration() {
	isCalibrating = false;
	// delete calib;
	streamID = -1;
}

void pilotCompass(const Command &command)
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

void handleFreeMemoryRequest(const Command &command) {
	int freeMem = freeMemory();
	char bts[2];
	shift(bts, freeMem, 2);
	respond(FREE_MEMORY, bts, command.messageID);
}

void resetProcessor() {
	resetFunc();
	// digitalWrite(RESET_PIN, LOW);
}

void changeBluetoothDeviceName(const Command &cmd) {
	char * command = malloc(strlen("AT+NAME") + strlen(cmd.payload));
	sprintf(
		command,
		"AT+NAME%s",
		cmd.payload
	);
	respond(LOG_INFO, cmd.payload);
	bluetoothSerial.write(command);
	delay(10);
	while(!bluetoothSerial.available()) {}
	char response[11];
	int byteToRead = 0;
	while(bluetoothSerial.available() && byteToRead < 11) {
		response[byteToRead++] = bluetoothSerial.read();
	}
	respond(LOG_INFO, response);
	respond(NAME_CHANGED, 0x00, cmd.messageID);
}