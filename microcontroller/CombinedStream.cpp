#include "CombinedStream.h"
#include <SoftwareSerial.h>

SoftwareSerial *bt;

SoftwareSerial* GetBlueTooth() {
    return bt;
}

void SetBlueTooth(SoftwareSerial &serial) {
    bt = &serial;
}