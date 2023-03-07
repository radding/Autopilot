
#include <EEPROM.h>

#include "eeprom.h"

int writeToEprom(int startAddress, char *data) {
    int len = sizeof(data)/sizeof(char);
    EEPROM.update(startAddress, len);
    for (int i = 1; i <= len; i++) {
        EEPROM.update(startAddress + i, data[i-1]);
    }
}
/**
 * Reads the data from the eeprom
*/
void readFromEprom(int startAddress, char *data) {

}
/**
 * Get the size of the data at address
*/
int sizeOfDataAt(int address) {

}
