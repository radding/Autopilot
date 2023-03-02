// The state of the autopilot
#ifndef STATE_H
#define STATE_H

enum State
{
	INIT,
	RECEIVING_COMMAND,
	COMMAND_RECEIVED,
	PILOTING_COMPASS,
	CONTINUOS_PRINT_HEADING,
};

// typedef void* (*StateFn)();

// void* InitState();
#endif
