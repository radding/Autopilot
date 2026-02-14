#!/usr/bin/env node
// TypeScript (.ts)
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Serial } from './serial/Serial';
import { CommunicationChannel } from './communication_channel/type';
import { Autopilot } from '@autopilot/library';
import { IdentifyV2 } from '@autopilot/library/src/cmdsv2/Identify';
import { CapabilitiesV2 } from '@autopilot/library/src/cmdsv2/Capabilities';
import { ChangeNameV2 } from '@autopilot/library/src/cmdsv2/ChangeName';
import { performWithSpinner } from './performWithTimeout';
import winston from 'winston';
import { GetDataV2, StreamDataV2 } from '@autopilot/library/src/cmdsv2/GetData';
import { DeviceData } from 'library/src/messages/service_pb';
import { CalibrateV2 } from '@autopilot/library/src/cmdsv2/Calibrate';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

let autopilotClient: Autopilot | null = null;

const connectionObjects: Record<
  string,
  {
    channel: CommunicationChannel<any>;
    addOptions?: (command: Command) => void;
  }
> = {
  serial: {
    channel: new Serial(),
    addOptions: (command: Command) => {
      command.option(
        '-b, --baud-rate <baudRate>',
        'Baud rate to connect to',
        '9600'
      );
    },
  },
  bluetooth: {
    channel: new Serial(),
  },
};

const program = new Command()
  .name('autopilot-cli')
  .description('CLI application for Autopilot with REPL interface')
  .version('1.0.0')
  .exitOverride();

program
  .command('set-log-level <level>')
  .description('Set the log level')
  .action((level: string) => {
    logger.level = level;
    logger.info(`Log level set to ${level}`);
  });

program
  .command('version')
  .description('Show version')
  .action(() => {
    console.log(chalk.blue('Autopilot CLI REPL'));
    console.log(chalk.gray(`Version ${program.version()}`));
  });

program
  .command('help')
  .description('Show help')
  .action(() => {
    program.outputHelp();
  });

program
  .command('calibrate')
  .description('Calibrate the device')
  .action(async () => {
    if (!autopilotClient) {
      console.log(chalk.red('Not connected'));
      return;
    }
    await performWithSpinner(
      async () => {
        await autopilotClient.send(new CalibrateV2());
      },
    { spinnerText: 'Calibrating device' }
  );
});


program
  .command('list <method>')
  .alias('ls')
  .option('-t, --timeout <timeout>', 'Timeout in milliseconds', '30000')
  .description('List available autopilots')
  .action(async (method: string, opts: { timeout: string }) => {
    if (!Object.keys(connectionObjects).includes(method)) {
      console.log(chalk.red(`Invalid protocol: ${method}`));
      return;
    }
    const spinner = ora(
      `Searching for available autopilots on ${method}...`
    ).start();
    const doSearch = async () => {
      const connectionObject =
        connectionObjects[method as keyof typeof connectionObjects].channel;
      const autopilots = await connectionObject.search();
      const promises = autopilots.map(async (autopilot) => {
        const connectionObject =
          connectionObjects[method as keyof typeof connectionObjects].channel;
        connectionObject.connect(autopilot);
        const autopilotClient = new Autopilot(connectionObject, logger);
        const identify = await autopilotClient.send(new IdentifyV2());
        await connectionObject.disconnect();
        return {
          name: identify.name,
          address: autopilot.address,
          port: autopilot.port,
          firmwareVersion: identify.firmwareVersion,
          serialNumber: identify.serialNumber,
        };
      });
      const results = await Promise.all(promises);
      spinner.succeed(`Found ${results.length} autopilots`);
      console.table(results);
    };
    const timeout = parseInt(opts.timeout);
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve('TIMED_OUT'), timeout);
    });
    const results = await Promise.race([doSearch(), timeoutPromise]);
    if (results === 'TIMED_OUT') {
      spinner.fail('Search timed out');
      // console.log(chalk.red('Search timed out'));
    }
    // console.log(results.map(result => `${result.name} - ${result.address} - ${result.port}`).join('\n'));
  });

program
  .command('retrieve')
  .alias('r')
  .description('Retrieve data from the device')
  .action(async () => {
    if (!autopilotClient) {
      console.log(chalk.red('Not connected'));
      return;
    }
    const data = await performWithSpinner(
      async () => await autopilotClient.send(new GetDataV2()), 
      { spinnerText: 'Retrieving data' });
    if (data.success === false) {
      console.error(data.error);
      return;
    }
    console.log(chalk.green('Data retrieved successfully'));
    console.log(chalk.yellow(`\tLatitude: ${data.data.latitude}`));
    console.log(chalk.yellow(`\tLongitude: ${data.data.longitude}`));
    console.log(chalk.yellow(`\tSpeed over ground: ${data.data.speedoverground}`));
    console.log(chalk.yellow(`\tCourse over ground: ${data.data.courseoverground}`));
    console.log(chalk.yellow(`\tMagnetic course: ${data.data.magneticcourse}`));
    console.log(chalk.yellow(`\tWind angle: ${data.data.windangle}`));
    console.log(chalk.yellow(`\tPiloting: ${data.data.piloting}`));
    console.log(chalk.yellow(`\tHas GPS fix: ${data.data.hasgpsfix}`));
    console.log(chalk.yellow(`\tTarget heading: ${data.data.targetheading}`));
  });

program
  .command('stream')
  .alias('s')
  .description('Stream data from the device')
  .action(async () => {
    if (!autopilotClient) {
      console.log(chalk.red('Not connected'));
      return;
    }
    const stream = await autopilotClient.stream(new StreamDataV2());
    stream.on('data', (data: DeviceData.AsObject) => {
      console.log(chalk.yellow(`\tLatitude: ${JSON.stringify(data)}`));
    console.log(chalk.green('Data retrieved successfully'));
    console.log(chalk.yellow(`\tLatitude: ${data.latitude}`));
    console.log(chalk.yellow(`\tLongitude: ${data.longitude}`));
    console.log(chalk.yellow(`\tSpeed over ground: ${data.speedoverground}`));
    console.log(chalk.yellow(`\tCourse over ground: ${data.courseoverground}`));
    console.log(chalk.yellow(`\tMagnetic course: ${data.magneticcourse}`));
    console.log(chalk.yellow(`\tWind angle: ${data.windangle}`));
    console.log(chalk.yellow(`\tPiloting: ${data.piloting}`));
    console.log(chalk.yellow(`\tHas GPS fix: ${data.hasgpsfix}`));
    console.log(chalk.yellow(`\tTarget heading: ${data.targetheading}`));
    });
  });

program
  .command('quit')
  .alias('q')
  .alias('exit')
  .alias('e')
  .description('Quit the program')
  .action(() => {
    console.log(chalk.blue('Goodbye!'));
    autopilotClient?.disconnect();
    process.exit(0);
  });

program
  .command('status')
  .description('Show connection status')
  .action(async () => {
    if (!autopilotClient) {
      console.log(chalk.red('Not connected'));
      return;
    }
    const status = await performWithSpinner(
      async () => {
        const identify = await autopilotClient.send(new IdentifyV2());
        const capabilities = await autopilotClient.send(new CapabilitiesV2());
        return {
          identify,
          capabilities,
        };
      },
      { spinnerText: 'Getting device information' }
    );

    if (status.success === false) {
      console.error(status.error);
      return;
    }

    const { capabilities, identify } = status.data;

    const capabilitiesArr: string[] = [];
    if (capabilities.wind) capabilitiesArr.push('Wind');
    if (capabilities.magnetic) capabilitiesArr.push('Magnetic');
    if (capabilities.gps) capabilitiesArr.push('GPS');
    console.log(chalk.green(`Connected to ${identify.name}`));
    console.log(
      chalk.yellow(`\tFirmware version: ${identify.firmwareVersion}`)
    );
    console.log(chalk.yellow(`\tSerial number: ${identify.serialNumber}`));
    console.log(chalk.yellow(`\tVersion: ${identify.version}`));
    console.log(chalk.yellow(`\tCapabilities: ${capabilitiesArr.join(' | ')}`));
    console.log(
      chalk.yellow(`\tFree memory: ${capabilities.freememory} bytes`)
    );
    console.log(chalk.yellow(`\tCurrent State: ${capabilities.state}`));
  });

const connectCommand = program.command('connect').alias('c');

Object.keys(connectionObjects).forEach((method) => {
  const connectionObject =
    connectionObjects[method as keyof typeof connectionObjects];

  const opts = connectCommand
    .command(`${method} <port>`)
    .description(`Connect via ${method}`)
    .action(async (port: string, opts) => {
      await performWithSpinner(
        async () => {
          await connectionObject.channel.connect({
            name: method,
            address: port,
            port: port,
            ...opts,
          });
          autopilotClient = new Autopilot(connectionObject.channel, logger);
          return await autopilotClient.send(new IdentifyV2());
        },
        {
          spinnerText: `Connecting to device on ${port} over ${method}`,
          doneText: (d) => `Connected to ${d.name}`,
          failedText: `Failed to connect to ${port}`,
        }
      );
    });
  if (connectionObject.addOptions) {
    connectionObject.addOptions(opts);
  }
});

program
  .command('configure')
  .description('Configure the device')
  .alias('cfg')
  .alias('config')
  .alias('conf')
  .option('-n, --name <name>', 'Name of the device')
  .action(async (opts: { name: string }) => {
    if (!autopilotClient) {
      console.log(chalk.red('Not connected'));
      return;
    }
    await performWithSpinner(
      async () => {
        const changeName = await autopilotClient.send(
          new ChangeNameV2(opts.name)
        );
        return changeName;
      },
      { spinnerText: 'Setting Configuration on Device' }
    );
  });

// let currentConnection = null;

const main = async () => {
  console.log(chalk.blue('Autopilot CLI REPL'));
  console.log(chalk.gray('Type "help" for available commands, "exit" to quit'));
  console.log('');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('autopilot> '),
  });

  rl.prompt();

  rl.on('line', async (line: string) => {
    const input = line.trim();

    try {
      await program.parseAsync(input.split(' '), { from: 'user' });
    } catch (error) {
      console.error(chalk.red(error.message));
    }
    rl.prompt();

    //   if (input === 'help') {
    //     console.log(chalk.yellow('Available commands:'));
    //     console.log('  connect-serial <port>     - Connect via USB Serial');
    //     console.log('  connect-bluetooth <addr>  - Connect via Bluetooth');
    //     console.log('  disconnect                - Disconnect');
    //     console.log('  ping                      - Send ping');
    //     console.log('  get-bearing               - Get current bearing');
    //     console.log('  set-bearing <degrees>     - Set desired bearing');
    //     console.log('  begin-pilot               - Start autopilot mode');
    //     console.log('  memory                    - Get free memory');
    //     console.log('  reset                     - Reset device');
    //     console.log('  calibrate                 - Start calibration');
    //     console.log('  change-name <name>        - Change device name');
    //     console.log('  status                    - Show connection status');
    //     console.log('  help                      - Show this help');
    //     console.log('  exit/quit                 - Exit REPL');
    //     console.log('');
    //   } else if (input.startsWith('connect-serial ')) {
    //     const port = input.substring('connect-serial '.length);
    //     const spinner = ora('Connecting via Serial...').start();
    //     try {
    //       // autopilot = new Autopilot(new Serial(port));
    //       // await autopilot.connect();
    //       currentConnection = 'serial';
    //       spinner.succeed(`Connected via Serial on ${port}`);
    //     } catch (error) {
    //       spinner.fail(`Failed to connect: ${error}`);
    //     }
    //   } else if (input.startsWith('connect-bluetooth ')) {
    //     const address = input.substring('connect-bluetooth '.length);
    //     console.log(chalk.yellow('Bluetooth connection not yet implemented'));
    //   } else if (input === 'disconnect') {
    //     if (!autopilot) {
    //       console.log(chalk.yellow('Not connected'));
    //     } else {
    //       const spinner = ora('Disconnecting...').start();
    //       try {
    //         await autopilot.disconnect();
    //         autopilot = null;
    //         currentConnection = null;
    //         spinner.succeed('Disconnected');
    //       } catch (error) {
    //         spinner.fail(`Failed to disconnect: ${error}`);
    //       }
    //     }
    //   } else if (input === 'ping') {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const spinner = ora('Sending ping...').start();
    //       try {
    //         // const response = await autopilot.sendCommand(new PingCmd());
    //         spinner.succeed(`Ping response: ${'response'}`);
    //       } catch (error) {
    //         spinner.fail(`Ping failed: ${error}`);
    //       }
    //     }
    //   } else if (input === 'get-bearing') {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const spinner = ora('Getting bearing...').start();
    //       try {
    //         // const response = await autopilot.sendCommand(new GetBearingCmd());
    //         spinner.succeed(`Current bearing: ${'response'}°`);
    //       } catch (error) {
    //         spinner.fail(`Failed to get bearing: ${error}`);
    //       }
    //     }
    //   } else if (input.startsWith('set-bearing ')) {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const bearing = input.substring('set-bearing '.length);
    //       const bearingValue = parseFloat(bearing);
    //       if (isNaN(bearingValue) || bearingValue < -1 || bearingValue > 360) {
    //         console.log(chalk.red('Bearing must be a number between -1 and 360'));
    //       } else {
    //         const spinner = ora(`Setting bearing to ${bearingValue}°...`).start();
    //         try {
    //           // const response = await autopilot.sendCommand(new SetDesiredBearingCmd(bearingValue));
    //           spinner.succeed(`Bearing set to ${bearingValue}°`);
    //         } catch (error) {
    //           spinner.fail(`Failed to set bearing: ${error}`);
    //         }
    //       }
    //     }
    //   } else if (input === 'begin-pilot') {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const spinner = ora('Starting autopilot...').start();
    //       try {
    //         // const response = await autopilot.sendCommand(new BeginPilotCmd());
    //         spinner.succeed('Autopilot started');
    //       } catch (error) {
    //         spinner.fail(`Failed to start autopilot: ${error}`);
    //       }
    //     }
    //   } else if (input === 'memory') {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const spinner = ora('Getting memory info...').start();
    //       try {
    //         // const response = await autopilot.sendCommand(new ReportFreeMemoryCommand());
    //         spinner.succeed(`Free memory: ${'response'} bytes`);
    //       } catch (error) {
    //         spinner.fail(`Failed to get memory info: ${error}`);
    //       }
    //     }
    //   } else if (input === 'reset') {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const spinner = ora('Resetting autopilot...').start();
    //       try {
    //         // const response = await autopilot.sendCommand(new ResetCommand());
    //         spinner.succeed('Autopilot reset');
    //       } catch (error) {
    //         spinner.fail(`Failed to reset: ${error}`);
    //       }
    //     }
    //   } else if (input === 'calibrate') {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const spinner = ora('Starting calibration...').start();
    //       try {
    //         // const response = await autopilot.sendCommand(new CalibrateCommand());
    //         spinner.succeed('Calibration started');
    //       } catch (error) {
    //         spinner.fail(`Failed to start calibration: ${error}`);
    //       }
    //     }
    //   } else if (input.startsWith('change-name ')) {
    //     if (!autopilot) {
    //       console.log(chalk.red('Not connected'));
    //     } else {
    //       const name = input.substring('change-name '.length);
    //       const spinner = ora(`Changing name to "${name}"...`).start();
    //       try {
    //         // const response = await autopilot.sendCommand(new changeNameCommand(name));
    //         spinner.succeed(`Name changed to "${name}"`);
    //       } catch (error) {
    //         spinner.fail(`Failed to change name: ${error}`);
    //       }
    //     }
    //   } else if (input === 'status') {
    //     if (!autopilot) {
    //       console.log(chalk.yellow('Status: Not connected'));
    //     } else {
    //       console.log(chalk.green(`Status: Connected via ${currentConnection}`));
    //     }
    //   } else if (input !== '') {
    //     console.log(chalk.red(`Unknown command: ${input}`));
    //     console.log(chalk.gray('Type "help" for available commands'));
    //   }

    //   rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.blue('Goodbye!'));
    process.exit(-1);
  });
};

main();
