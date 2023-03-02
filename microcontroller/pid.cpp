#include "pid.h"
#include "Command.h"

void ArduPID::begin(double *_input,
										double *_output,
										double *_setpoint,
										const double &_p,
										const double &_i,
										const double &_d,
										const pOn &_pOn,
										const dir &_direction,
										const unsigned int &_minSamplePeriodMs,
										const double &_bias)
{
	input = _input;
	output = _output;
	setpoint = _setpoint;
	setCoefficients(_p, _i, _d);
	setPOn(_pOn);
	setBias(_bias);
	setDirection(_direction);
	setSampleTime(_minSamplePeriodMs);

	reset();
	start();
}

void ArduPID::start()
{
	if (modeType != ON)
	{
		modeType = ON;
		reset();
	}
}

void ArduPID::reset()
{
	curError = 0;
	curSetpoint = 0;
	curInput = 0;

	lastError = 0;
	lastSetpoint = 0;
	lastInput = 0;

	pOut = 0;
	iOut = 0;
	dOut = 0;

	timer.start();
}

void ArduPID::stop()
{
	if (modeType != OFF)
		modeType = OFF;
}

void ArduPID::compute()
{
	if (timer.fire() && modeType == ON)
	{
		kp = pIn;
		ki = iIn * (timer.timeDiff / 1000.0);
		kd = dIn / (timer.timeDiff / 1000.0);

		if (direction == BACKWARD)
		{
			kp *= -1;
			ki *= -1;
			kd *= -1;
		}

		lastInput = curInput;
		lastSetpoint = curSetpoint;
		lastError = curError;

		curInput = *input;
		curSetpoint = *setpoint;
		curError = curSetpoint - curInput;

		double dInput = *input - lastInput;

		if (pOnType == P_ON_E)
			pOut = kp * curError;
		else if (pOnType == P_ON_M)
			pOut = -kp * dInput;

		dOut = -kd * dInput; // Derrivative on measurement

		double iTemp = iOut + (ki * ((curError + lastError) / 2.0)); // Trapezoidal integration
		iTemp = constrain(iTemp, windupMin, windupMax);							 // Prevent integral windup

		double outTemp = bias + pOut + dOut;												// Output without integral
		double iMax = constrain(outputMax - outTemp, 0, outputMax); // Maximum allowed integral term before saturating output
		double iMin = constrain(outTemp - outputMin, outputMin, 0); // Minimum allowed integral term before saturating output

		iOut = constrain(iTemp, iMin, iMax);
		double newOutput = bias + pOut + iOut + dOut;

		newOutput = constrain(newOutput, outputMin, outputMax);
		*output = newOutput;
	}
}

void ArduPID::setOutputLimits(const double &min, const double &max)
{
	if (max > min)
	{
		outputMax = max;
		outputMin = min;

		if (modeType == ON)
			*output = constrain(*output, outputMin, outputMax);
	}
}

void ArduPID::setWindUpLimits(const double &min, const double &max)
{
	if (max > min)
	{
		windupMax = max;
		windupMin = min;
	}
}

void ArduPID::setDeadBand(const double &min, const double &max)
{
	if (max >= min)
	{
		deadBandMax = max;
		deadBandMin = min;
	}
}

void ArduPID::setPOn(const pOn &_pOn)
{
	pOnType = _pOn;
}

void ArduPID::setBias(const double &_bias)
{
	bias = _bias;
}

void ArduPID::setCoefficients(const double &_p, const double &_i, const double &_d)
{

	if (_p >= 0 && _i >= 0 && _d >= 0)
	{
		pIn = _p;
		iIn = _i;
		dIn = _d;
	}
}

void ArduPID::setDirection(const dir &_direction)
{
	direction = _direction;

	if (modeType == ON)
		reset();
}

void ArduPID::reverse()
{
	if (direction == FORWARD)
		direction = BACKWARD;
	else if (direction == BACKWARD)
		direction = FORWARD;

	if (modeType == ON)
		reset();
}

void ArduPID::setSampleTime(const unsigned int &_minSamplePeriodMs)
{
	timer.begin(_minSamplePeriodMs);
}

double ArduPID::B()
{
	return bias;
}

double ArduPID::P()
{
	return pOut;
}

double ArduPID::I()
{
	return iOut;
}

double ArduPID::D()
{
	return dOut;
}

void ArduPID::debug(const byte &mask)
{
	char msg[35];
	char fpMsg[10];
	if (mask & PRINT_INPUT)
	{
		dtostrf(*input, 1, 2, fpMsg);
		sprintf(msg, "_input:%s", fpMsg);
		respond(LOG_TRACE, msg);
	}

	if (mask & PRINT_OUTPUT)
	{
		dtostrf(*output, 1, 2, fpMsg);
		sprintf(msg, "_output:%s", fpMsg);
		respond(LOG_TRACE, msg);
	}

	if (mask & PRINT_SETPOINT)
	{
		dtostrf(*setpoint, 1, 2, fpMsg);
		sprintf(msg, "_setPoint:%s", fpMsg);
		respond(LOG_TRACE, msg);
	}

	if (mask & PRINT_BIAS)
	{
		dtostrf(bias, 1, 2, fpMsg);
		sprintf(msg, "_bias:%s", fpMsg);
		respond(LOG_TRACE, msg);
	}

	if (mask & PRINT_P)
	{
		dtostrf(pOut, 1, 2, fpMsg);
		sprintf(msg, "p:%s", fpMsg);
		respond(LOG_TRACE, msg);
	}

	if (mask & PRINT_I)
	{
		dtostrf(iOut, 1, 2, fpMsg);
		sprintf(msg, "i:%s", fpMsg);
		respond(LOG_TRACE, msg);
	}

	if (mask & PRINT_D)
	{
		dtostrf(dOut, 1, 2, fpMsg);
		sprintf(msg, "d:%s", fpMsg);
		respond(LOG_TRACE, msg);
	}
}