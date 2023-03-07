import { CommandCode } from "../commands";
import { ResponseCode } from "../responses";
import { EmptyResponse } from "./BeginPilotCmd";
import { CommandBuilder, createSimpleCmd } from "./cmdCreator";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

export const StopCalibratingCommand = CommandBuilder.builder()
    .withCommandCode(CommandCode.STOP_CALIBRATING)
    .build();

export const CalibrateCommand = CommandBuilder.builder()
    .withCommandCode(CommandCode.CALIBRATE_COMPASS)
    .withTimeoutMS(5 * minute)
    .withTimeOutCommand(new StopCalibratingCommand())
    .withExpectedResponse(EmptyResponse(ResponseCode.CALIBRATION_DONE))
    .build();