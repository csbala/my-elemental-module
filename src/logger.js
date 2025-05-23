/**
 * Custom logger for the Elemental Module with configurable log levels.
 */
class Logger {
  constructor() {
    // Initialize logLevel to "info" by default
    this.logLevel = "info";

    // Safely get the log level from the environment variable
    try {
      // Check if process and process.env are defined
      if (typeof process !== "undefined" && process.env) {
        const envLogLevel = process.env.ELEMENTAL_MODULE_LOG_LEVEL;
        if (envLogLevel && ["info", "debug"].includes(envLogLevel)) {
          this.logLevel = envLogLevel;
        }
      }
    } catch (error) {
      // Fallback to "info" if accessing process.env fails
      this.logLevel = "info";
    }
  }

  /**
   * Logs an info message if the log level is "info" or "debug".
   * @param {...any} args - Arguments to log.
   */
  info(...args) {
    if (this.logLevel === "info" || this.logLevel === "debug") {
      console.log(...args);
    }
  }

  /**
   * Logs a debug message if the log level is "debug".
   * @param {...any} args - Arguments to log.
   */
  debug(...args) {
    if (this.logLevel === "debug") {
      console.log(...args);
    }
  }

  /**
   * Logs an error message regardless of log level.
   * @param {...any} args - Arguments to log.
   */
  error(...args) {
    console.error(...args);
  }
}

export const logger = new Logger();
