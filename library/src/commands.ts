export enum CommandCode {
	
	/**
	 * Respond with current magnetic bearing
	 */
	GET_BEARING = 0x01,
	/**
	 * Set our desired bearing
	 */
	SET_DESIRED_BEARING = 0x02,
	/**
	 * Calibrate the compass
	 */
	CALIBRATE_COMPASS = 0x03,
	/**
	 * Begin piloting on compass reading
	 */
	BEGIN_PILOT_COMPASS = 0x04,
	/**
	 * Continue to print our bearing
	 */
	CONTINUOS_GET_HEADING = 0x05,

	/**
	 * End piloting by compass
	 */
	END_PILOT_COMPASS = 0x06,

	STOP_SENDING_HEADING = 0x07,

	PING,

	/**
	 * Report how much free memory we have available
	*/
	REPORT_FREE_MEMORY,

	/**
	 * Reboot the processor
	*/
	RESET_UNIT,

	STOP_CALIBRATING,

	CHANGE_NAME,

	STREAM_CALIBRATION_DATA,
	STOP_STREAMING_CALIBRATION_DATA,

	_last,
};