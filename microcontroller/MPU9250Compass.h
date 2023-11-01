#ifndef MPU9250_COMPASS_H
#define MPU9250_COMPASS_H

#include <MPU9250_WE.h>

#include "Compass.h"
#include "Command.h"

#ifndef MPU9250_ADDR
#define MPU9250_ADDR 0x68
#endif

class MPU9250Compass: public Compass {

private:
    MPU9250_WE _device = MPU9250_WE(MPU9250_ADDR);
public:
    int initialize();
    void read();
    MPU9250Compass() {}

};

#endif