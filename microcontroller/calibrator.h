#ifndef CALIBRATOR_H
#define CALIBRATOR_H

#include <QMC5883LCompass.h>

#include "Command.h"

class Calibrator
{
private:
	QMC5883LCompass *compass;

public:
	Calibrator(const QMC5883LCompass &);
	~Calibrator();
	calibrate(Command cmd);
};

#endif