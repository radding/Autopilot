import { AutopilotClient, AutopilotCommand } from "../Autopilot";
import { CommandCode } from "../commands";
import { ResponseCode } from "../responses";
import { ResponseTransformer } from "../Serial";
import { AckResponse } from "./BeginPilotCmd";

export const createSimpleCmd = <T = AckResponse>(commandCode: CommandCode, r?: ResponseTransformer<T>) => {
	const builder = CommandBuilder.builder()
		.withCommandCode(commandCode);

	if (r !== undefined) {
		builder.withExpectedResponse(r);
	}
	return builder.build();
}

export class CommandBuilder {
	private expectedResponse?: ResponseTransformer<any>;
	private commandCode?: CommandCode;
	private payloadSerializer: (val: any) => Uint8Array;
	private timeOutValue?: number;
	private timeOutCommand?: AutopilotCommand<AckResponse>;

	static builder() {
		return new CommandBuilder();
	}

	constructor() {
		this.payloadSerializer = () => new Uint8Array();
		this.expectedResponse = AckResponse() as any;
	}

	withExpectedResponse(transformer: ResponseTransformer<any>) {
		this.expectedResponse = transformer;
		return this;
	}

	withCommandCode(code: CommandCode) {
		this.commandCode = code;
		return this;
	}

	withPayloadSerializer(serializer: (val: any) => Uint8Array) {
		this.payloadSerializer = serializer;
		return this;
	}


	withTimeoutMS(timeMS: number) {
		this.timeOutValue = timeMS;
		return this;
	}

	withTimeOutCommand(command: AutopilotCommand<AckResponse>) {
		this.timeOutCommand = command;
		return this;
	}


	build<T=AckResponse, TPayload=never>() {
		const me = this;
		return class implements AutopilotCommand<T> {
			command: CommandCode;
			payload: Uint8Array;
			expectedResponse: ResponseTransformer<T>;
			timeoutMS?: number;
			timeOutCommand?: AutopilotCommand<AckResponse>;
			

			constructor(value?: TPayload) {
				this.command = me.commandCode!;
				this.payload = me.payloadSerializer(value);
				this.expectedResponse = me.expectedResponse!;
				this.timeoutMS = me.timeOutValue;
				this.timeOutCommand = me.timeOutCommand;
			}
		}
	}
}