#ifndef MY_EEPROM_H 
#define MY_EEPROM_H
#include <EEPROM.h>

#ifndef byte
#define byte uint8_t
#endif

/*
 * Writes data to the eeprom, starting at address startAddress.
 This will store the size of data at start address, and then read from it.
*/
int writeToEprom(int startAddress, char *data);
/**
 * Reads the data from the eeprom
*/
void readFromEprom(int startAddress, char *data);
/**
 * Get the size of the data at address
*/
int sizeOfDataAt(int address);

template <class T> int saveInEeprom(int ee, const T& value)
{
  const byte* p = (const byte*)(const void*)&value;
  unsigned int i;
  for (i = 0; i < sizeof(value); i++)
    EEPROM.update(ee++, *p++);
    return i;
}
template <class T> int readFromEeprom(int ee, T& value)
{
    byte* p = (byte*)(void*)&value;
    unsigned int i;
    for (i = 0; i < sizeof(value); i++)
          *p++ = EEPROM.read(ee++);
    return i;
}

#endif