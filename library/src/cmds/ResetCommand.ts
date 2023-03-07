
import { CommandCode } from "../commands";

import {createSimpleCmd} from "./cmdCreator";

export const ResetCommand = createSimpleCmd(CommandCode.RESET_UNIT);