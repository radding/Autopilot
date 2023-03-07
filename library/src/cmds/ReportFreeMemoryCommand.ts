import { CommandCode } from "../commands";
import { RawResponse, ResponseTransformer } from "../Serial";

import {createSimpleCmd} from "./cmdCreator";

interface Memory {
    available: number
}

export class FreeMemoryResponse implements ResponseTransformer<Memory> {
	toResponse(raw: RawResponse): Memory {
		return {
			available: Buffer.from(raw.payload!).readUint16LE(),
		}
	}

}

export const ReportFreeMemoryCommand = createSimpleCmd(CommandCode.REPORT_FREE_COMMAND, new FreeMemoryResponse());