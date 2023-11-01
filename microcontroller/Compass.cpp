#include <Arduino.h>
#include <math.h>
#include "Compass.h"
#include "Command.h"

float Compass::getHeading() {
    #ifdef USE_NED
        return bearingUsingNED();
    #else
        return bearingFromInstructables();
    #endif

}

float Compass::bearingFromInstructables() {
    float xHorizontal = _magValues.getX() * cosf(_pitch) + sinf(_roll) * sin(_pitch) - _magValues.getZ() * cosf(_roll) * sinf(_pitch);
    float yHorizontal = _magValues.getY() * cosf(_roll) + _magValues.getZ() * sinf(_roll);

    float bearing = atan2f(xHorizontal, yHorizontal) * (180.0f / (float) PI);
    if (bearing < 0) {
        return 360 + bearing;
    } else if (bearing > 360) {
        return bearing - 360;    
    } else {
        return bearing;
    }
}

float Compass::bearingUsingNED() {
    return calculateHeading(_accelValues, _magValues);
}

Vector3D::Vector3D() {
    x = 0;
    y = 0;
    z = 0;
}

float fastInverseSqrt(const float &x) {
   typedef union {
        float f;
        int32_t i;
    } Union32;

    Union32 union32 = {.f = x};
    union32.i = 0x5F1F1412 - (union32.i >> 1);
    return union32.f * (1.69000231f - 0.714158168f * x * union32.f * union32.f);
}

#ifdef USE_MPU9250_WE
Vector3D::Vector3D(xyzFloat & other) {
    x = other.x;
    y = other.y;
    z = other.z;
}
#endif

Vector3D Vector3D::applyScalar(const float &scalar) {
    x *= scalar;
    y *= scalar;
    z *= scalar;
    return this;
}

Vector3D Vector3D::hadamardProductWith(const Vector3D &other) {
    Vector3D newVec;
    newVec.x = x * other.x;
    newVec.y = y * other.y;
    newVec.z = z * other.z;
    return newVec;
}

float Vector3D::sum() {
    return x + y + z;
}

float Vector3D::magnitudeSquared() {
    return hadamardProductWith(*this).sum();
}

Vector3D Vector3D::normalized() {
    return applyScalar(fastInverseSqrt(magnitudeSquared()));
}

Vector3D Vector3D::crossProductWith(const Vector3D &b) {
    Vector3D newVec;
    newVec.x = y * b.y - z * b.y;
    newVec.y = z * b.x - x * b.z;
    newVec.z = x * b.y - y * b.x;
    return newVec;
}

float calculateHeading(const Vector3D &accelData, const Vector3D &magneticData) {
    Vector3D up = accelData.applyScalar(-1.0f);

    Vector3D west = up.crossProductWith(magneticData).normalized();
    Vector3D north = west.crossProductWith(up).normalized();

    float bearing = atan2f(west.getX(), north.getX()) * (180.0f / (float) PI);
    if (bearing < 0) {
        return 360 + bearing;
    } else if (bearing > 360) {
        return bearing - 360;    
    } else {
        return bearing;
    }
}

// Compass::Compass() {
// //     #ifdef USE_MPU9250_WE
// //     MPU9250_WE comp = MPU9250_WE(MPU9250_ADDR);
// //     compass = comp;
// //     #endif
// }

// // int Compass::initialize() {
// //     #ifdef USE_MPU9250_WE
// //     if(!compass.init()){
// //     	respond(FATAL, "can't initialize MPU9250");
// // 		delay(100);
// //         return 1;
// // 		// resetFunc(); // If we can't initialize the compass, then we are done here.
// //   	}
// // 	if(!compass.initMagnetometer()){
// // 		respond(FATAL, "can't initialize magnetometer.");
// // 		delay(100);
// //         return 2;
// // 		// resetFunc();
// //   	}
// // 	compass.setMagOpMode(AK8963_CONT_MODE_100HZ);
// // 	compass.autoOffsets();
// // 	compass.setAccRange(MPU9250_ACC_RANGE_2G);
// // 	compass.enableAccDLPF(true);
// // 	compass.setAccDLPF(MPU9250_DLPF_6);
// //     delay(200);
// //     return 0;
// //     #endif
// // }

// // Vector3D Compass::getAccelData() {
// //     #ifdef USE_MPU9250_WE
// //     xyzFloat v = compass.getGValues();
// //     return Vector3D(v);
// //     #endif
// // }

// // Vector3D Compass::getMagneticData() {
// //     #ifdef USE_MPU9250_WE
// //     xyzFloat v = compass.getMagValues();
// //     return Vector3D(v);
// //     #endif
// // }

// // Vector3D Compass::getGyroData() {
// //     #ifdef USE_MPU9250_WE
// //     #endif
// // }

// // void fillVectors(const MPU9250_WE &compass, Vector3D &targetAccelData, Vector3D &targetMagData) {
// //     xyzFloat magValues = compass.getMagValues(); // returns magnetic flux density [µT] 
// //     xyzFloat accelVals = compass.getGValues();
// //     targetAccelData = accelVals;
// //     targetMagData = magValues;
// // }