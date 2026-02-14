#include "statemanagement.h"
#include <FreeRTOS.h>
#include <semphr.h>

AutopilotState state = AutopilotState_Standby;
SemaphoreHandle_t xMutex_state;

void initState()
{
    xMutex_state = xSemaphoreCreateMutex();
    state = AutopilotState_Standby;
}

void setState(AutopilotState newState)
{
    // if (xSemaphoreTake(xMutex_state, portMAX_DELAY) == pdTRUE)
    // {
    state = newState;
    // xSemaphoreGive(xMutex_state);
    // }
}

void getState(AutopilotState &newState)
{
    // if (xSemaphoreTake(xMutex_state, portMAX_DELAY) == pdTRUE)
    // {
    newState = state;
    // xSemaphoreGive(xMutex_state);
}