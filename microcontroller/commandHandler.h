#ifndef COMMANDHANDLER_H
#define COMMANDHANDLER_H

#include "Command.h"

typedef void (*handlerFn)(const Command &);

class CommandHandler
{
private:
	handlerFn *handlers;

public:
	CommandHandler(handlerFn *);
	~CommandHandler();

	void addHandler(const Commands &code, handlerFn handler);
	void broker(const Command &cmd);
};

template <typename Func>
handlerFn to_handler_fn(Func lambda)
{
	void (decltype(lambda)::*ptr)(const Command &) const = &decltype(lambda)::operator();
	return lambda.*ptr;
}

#endif