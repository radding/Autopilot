#ifndef CALIBRATOR_H
#define CALIBRATOR_H

#include <QMC5883LCompass.h>

#include "Command.h"



class Calibrator
{
private:
	QMC5883LCompass *compass;
	bool changed = false;
	bool done = false;
	int t = 0;
	int c = 0;

public:
	Calibrator(const QMC5883LCompass &);
	~Calibrator();
	void calibrate();
	bool getIsDone();

	int calibrationData[3][2];
};

void saveToEEprom(int startAddr, int **dataToSave);
void retreiveFromEEProm(int startAddr, int **target);
#endif