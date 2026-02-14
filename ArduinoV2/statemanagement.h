#pragma once
#include "service.pb.h"

void setState(AutopilotState state);
void getState(AutopilotState &state);
void initState();