import * as log from "@std/log";
import { LevelName } from "@std/log";

let lastLog: string = "";
let lastRequest: string = "";
let traceRequest: boolean = false;

export function initLogger(level: LevelName, log_request: boolean) {
  traceRequest = log_request;
  log.setup({
    handlers: {
      default: new log.ConsoleHandler(level, {
        useColors: true,
        formatter: (record) =>
          `[${record.levelName}] ${record.datetime.toLocaleDateString()} ${record.datetime.toLocaleTimeString()} - ${record.msg}`,
      }),
    },
    loggers: {
      default: {
        level: level,
        handlers: ["default"],
      },
    },
  });
}

export function debug(msg: string) {
  if (msg.startsWith("Getting performance data from") && msg === lastLog) {
    return;
  }
  log.getLogger().debug(msg);
  lastLog = msg;
}

export function info(msg: string) {
  log.getLogger().info(msg);
  lastLog = msg;
}

export function warn(msg: string) {
  log.getLogger().warn(msg);
  lastLog = msg;
}

export function error(msg: string) {
  log.getLogger().error(msg);
  lastLog = msg;
}

export function critical(msg: string) {
  log.getLogger().critical(msg);
  lastLog = msg;
}

export function logRequest(msg: string) {
  if (msg === lastRequest || !traceRequest) {
    return;
  }
  console.log(`%c${msg}`, "color: green");
  lastRequest = msg;
}
