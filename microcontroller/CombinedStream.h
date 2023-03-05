#ifndef COMBINEDSTREAM_H
#define COMBINEDSTREAM_H
#include <SoftwareSerial.h>

SoftwareSerial* GetBlueTooth();
void SetBlueTooth(SoftwareSerial &serial);

#endif