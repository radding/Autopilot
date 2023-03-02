# Autopilot Library

A Typescript library for issuing commands to the autopilot brain.

## Usage

As of writing, only the USB interface is working, so first plugin the board to your computer.
Run `arduino-cli board list` to find which usb port the board is plugged into.

Here is a quick getting started script:

```typescript
import { AutopilotClient, GetBearingCommand } from "autopilot-library";

const autopilot = new AutopilotClient({
  serialConfig: {
    port: "/dev/ttyACM0", // Replace this with the the port from arduino-cli board list
  },
  logger: console,
  disableHeartbeat: true, // TODO: Make this the default
});

const bearing = await autopilot.send(new GetBearingCommand());
console.log(`your current bearing is ${bearing}`);
```

Line by line explanation:

1. `import { AutopilotClient, GetBearingCommand } from "autopilot-library";` This imports the client
for use, as well as the GetBearingCommand.

2. `const autopilot = new AutopilotClient({...})`. This instantiates a new autopilot client.

3. `const bearing = autopilot.send(new GetBearingCommand());` This sends the command to the unit
and returns the response.

## Documentation

### `AutopilotClient`

This is the client that sends commands and receives responses. Here are the options to instantiate:

```Typescript
interface AutopilotClientProperties {
  serialConfig?: {
    port?: string; // The Port or path to the USB device
    serialPort?: stream.Duplex; // The Duplex Stream that supports the underlying communication.
    serialInterface?: SerialInterface; // The actual serial interface that manages the stream
    baud?: number // The baud rate for the communication defaults to 9600
  },
  logger?: Logger; // Optional logger. defaults to the standard console
  disableHeartbeat?: boolean; // Disable the heartbeat. The heartbeat is basically a way for the client to be able to tell if the device is responsive
}
```

Of the the options, you must supply one of `serialConfig.port`, `serialConfig.serialPort`, or `serialConfig.serialInterface`. If you are communicating purely by USB, you only need to supply the the port option.

### Commands

#### `BeginPilotCompassCmd`

Sends the begin pilot command. This instructs the microcontroller to start piloting to a bearing.
You must send a SetDesiredBearingCmd first.

#### `SetDesiredBearingCmd`

Sets the desired bearing to sail to.

#### `EndPilotCompassCmd`

Tells the pilot to stop piloting.

#### `GetBearingCommand`

Gets the current bearing.

#### `HeadingStream`

Continuously streams the heading back to the client. You must call `autopilot.stream` with this command.
