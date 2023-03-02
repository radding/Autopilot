#include "calibrator.h"

Calibrator::Calibrator(const QMC5883LCompass &compass)
{
	this->compass = &compass;
}

Calibrator::~Calibrator()
{
}