#pragma once

void writeStringToEEPROM(int addrOffset, const String &strToWrite);
String readFromEEPROM(int addrOffset);