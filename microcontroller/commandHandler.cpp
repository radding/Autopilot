#include "commandHandler.h"

CommandHandler::CommandHandler(handlerFn *handlers)
{
	this->handlers = handlers;
	memset(handlers, 0, sizeof(handlers));
}

CommandHandler::~CommandHandler()
{
	free(handlers);
}

void CommandHandler::addHandler(const Commands &code, handlerFn handler)
{
	handlers[static_cast<int>(code)] = handler;
}

void CommandHandler::broker(const Command &cmd)
{
	handlerFn fn = handlers[cmd.command];
	if (fn == 0)
	{
		respond(LOG_WARN, "handler not found");
		respond(UNRECOGNIZED_COMMAND, 0x00, cmd.messageID);
		return;
	}
	fn(cmd);
}