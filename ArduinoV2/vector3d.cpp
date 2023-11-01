#include <Arduino.h>
#include <math.h>
#include "vector3d.h"

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

Vector3D::Vector3D(float _x, float _y, float _z) {
  x = _x;
  y = _y;
  z = _z;
}

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

float calculateHeading(Vector3D &accelData, Vector3D &magneticData) {
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
