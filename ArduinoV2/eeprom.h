// #pragma once
#ifndef EEPROM_H
#define EEPROM_H

void writeStringToEEPROM(int addrOffset, char *strToWrite);
char *readFromEEPROM(int addrOffset);

#endif