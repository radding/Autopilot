#ifndef VECTOR3D_H
#define VECTOR3D_H

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
    Vector3D(float _x, float _y, float _z);
    Vector3D applyScalar(const float &scalar);
    Vector3D hadamardProductWith(const Vector3D &);
    float sum();
    float magnitudeSquared();
    Vector3D normalized();
    Vector3D crossProductWith(const Vector3D &);
};

float calculateHeading(Vector3D &accelData, Vector3D &magneticData);
#endif