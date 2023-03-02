/**
 * Responses this command can send back to master device
 */
export enum ResponseCode {
	/**
	 * The heading from the comapss
	 */
	HEADING = 0x01,
	/**
	 * LOG an error
	 */
	LOG_ERROR = 0x02,
	/**
	 * A fatal unrecoverable error
	 */
	FATAL = 0x03,
	/**
	 * Log info
	 */
	LOG_INFO = 0x04,
	/**
	 * Log trace information
	 */
	LOG_TRACE = 0x05,
	/**
	 * Log warning information
	 */
	LOG_WARN = 0x06,
	/**
	 * The previous command was unrecognized
	 */
	UNRECOGNIZED_COMMAND = 0x07,

	/**
	 * The previous command was acknowledged
	 */
	ACK = 0x08,

	/**
	 * Module is ready
	 */
	MODULE_READY = 0x09,

	PONG = 0x0A,

	/**
	 * The desired heading was not set
	 */
	ERR_NO_DESIRED_HEADING = 0x0B,

};