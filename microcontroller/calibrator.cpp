#include "calibrator.h"

Calibrator::Calibrator(const QMC5883LCompass &compass)
{
	this->compass = &compass;
}

Calibrator::~Calibrator()
{
}

void Calibrator::calibrate() {
	int x, y, z;
  
  // Read compass values
  compass->read();

  // Return XYZ readings
  x = compass->getX();
  y = compass->getY();
  z = compass->getZ();

  changed = false;

  if(x < calibrationData[0][0]) {
    calibrationData[0][0] = x;
    changed = true;
  }
  if(x > calibrationData[0][1]) {
    calibrationData[0][1] = x;
    changed = true;
  }

  if(y < calibrationData[1][0]) {
    calibrationData[1][0] = y;
    changed = true;
  }
  if(y > calibrationData[1][1]) {
    calibrationData[1][1] = y;
    changed = true;
  }

  if(z < calibrationData[2][0]) {
    calibrationData[2][0] = z;
    changed = true;
  }
  if(z > calibrationData[2][1]) {
    calibrationData[2][1] = z;
    changed = true;
  }

  if (changed && !done) {
    // Serial.println("CALIBRATING... Keep moving your sensor around.");
    c = millis();
  }
    t = millis();
  
  
  if ( (t - c > 5000) && !done) {
    done = true;
	return calibrationData;
  }
}

bool Calibrator::getIsDone() {
	return this->done;
}


void saveToEEprom(int startAddr, int **dataToTarget) {

}

void retreiveFromEEProm(int startAddr, int **dataTarget) {

}

// int *[2] Calibrator::getCalibrationData() {
// 	return calibrationData;
// }