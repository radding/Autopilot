#include "MPU9250Compass.h"

void MPU9250Compass::read() {
    xyzFloat vals = _device.getMagValues();
    _magValues = Vector3D(vals);

    vals =_device.getGValues();
    _accelValues = Vector3D(vals);
    
    vals = _device.getGyrValues();
    _gyroValues = Vector3D(vals);

    _pitch = _device.getPitch();
    _roll = _device.getRoll();
}

int MPU9250Compass::initialize() {
    if(!_device.init()){
    	respond(FATAL, "can't initialize MPU9250");
		delay(100);
        // return 1;
  	}
	if(!_device.initMagnetometer()){
		respond(FATAL, "can't initialize magnetometer.");
		delay(100);
        return 2;
  	}
	_device.setMagOpMode(AK8963_CONT_MODE_100HZ);
	_device.autoOffsets();
	_device.setAccRange(MPU9250_ACC_RANGE_2G);
	_device.enableAccDLPF(true);
	_device.setAccDLPF(MPU9250_DLPF_6);
    delay(200);
}