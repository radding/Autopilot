
#ifndef COMPASS_H
#define COMPASS_H

#ifdef USE_MPU9250_WE
#include <MPU9250_WE.h>
#endif
#include "Command.h"

class Vector3D {
    float x;
    float y;
    float z;
public:
    float getX() {return x;}
    float getY() {return y;}
    float getZ() {return z;}
    Vector3D();
    Vector3D(Vector3D *vec) {
        x = vec->x;
        y = vec->y;
        z = vec->z;
    }
    Vector3D applyScalar(const float &scalar);
    Vector3D hadamardProductWith(const Vector3D &);
    float sum();
    float magnitudeSquared();
    Vector3D normalized();
    Vector3D crossProductWith(const Vector3D &);

    #ifdef USE_MPU9250_WE
    Vector3D(xyzFloat &);
    #endif
};

class Compass {

protected:

    float bearingFromInstructables();
    float bearingUsingNED();

protected:
    Vector3D _magValues;
    Vector3D _accelValues;
    Vector3D _gyroValues;
    float _pitch;
    float _roll;

public:

    Compass() {};
    /**
     * returns the heading as degrees.
    */
    float getHeading();
    /**
     * Initalize the compass. Set calibration values, wake up devices, etc
    */
    int initialize() {
        respond(FATAL, "Calling base compass");
        return -1;
    };
    /**
     * Read the values from the device.
    */
    void read() {
        respond(FATAL, "Calling base compass");
    };

    Vector3D getMag() {
        return _magValues;
    }
    
    Vector3D getAccel() {
        return _accelValues;
    }

    Vector3D getGyro() {
        return _gyroValues;
    }
};

float calculateHeading(const Vector3D &, const Vector3D &);
#endif