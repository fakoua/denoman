import { join } from "@std/path";
import { ensureDir, exists } from "@std/fs";
import { Application, Router } from "@oak/oak";
import { parseArgs } from "@std/cli";

import * as logging from "./src/logging.ts";
import { oakCors } from "./vendor/deno.land/x/cors@v1.2.2/mod.ts";
import { actions, getDependsServices, getServices } from "./src/services.ts";
import { getProcesses } from "./src/processes.ts";
import {
  getDevices,
  getGroups,
  getPerfmon,
  getSystem,
  getUsers,
} from "./src/system.ts";
import { executeCommand } from "./src/command.ts";
import * as cache from "./src/memcache.ts";
import {
  ContextApiName,
  DependenciesModel,
  GroupModel,
  ServiceModel,
  SystemModel,
  UserModel,
  WinRMPayload,
} from "./src/models.ts";
import { initServer } from "./build-tools/binToTs.ts";
import { LevelName } from "jsr:@std/log@^0.218.2/levels";

const flags = parseArgs(Deno.args, {
  boolean: ["log-request"],
  string: ["level"],
  default: { "log-request": false, level: "INFO" },
});

let logLevel = flags.level.toUpperCase();

if (
  !(logLevel === "NOTSET" || logLevel === "DEBUG" || logLevel === "INFO" ||
    logLevel === "WARN" || logLevel === "ERROR" || logLevel === "CRITICAL")
) {
  logLevel = "INFO";
}

logging.initLogger(logLevel as LevelName, flags["log-request"]);

logging.info("Starting server...");

await initServer(await getWwwRoot());

const router = new Router();

router.get("/api/exit", (ctx) => {
  ctx.response.body = true;
  logging.info("Exiting...");
  setTimeout(() => {
    Deno.exit(0);
  }, 200);
});

router.get("/api/:apiName", async (ctx) => {
  const payload: WinRMPayload = getPayload(ctx.request.url.searchParams);

  switch (ctx.params.apiName) {
    case "service":
      await handleService(ctx, payload);
      break;
    case "dependencies":
      await handleDependencies(ctx, payload);
      break;
    case "system":
      await handleSystem(ctx, payload);
      break;
    case "process":
      await handleProcess(ctx, payload);
      break;
    case "perfmon":
      await handlePerfmon(ctx, payload);
      break;
    case "device":
      await handleDevice(ctx, payload);
      break;
    case "users":
      await handleUsers(ctx, payload);
      break;
    case "groups":
      await handleGroups(ctx, payload);
      break;
    default:
      ctx.throw(404, "API not found");
  }
});

router.post("/api/service", async (ctx) => {
  const payload: WinRMPayload = getPayload(ctx.request.url.searchParams);

  const req = await ctx.request.body.json();
  const service = await actions(req.serviceName, req.action, payload);

  if (service !== undefined) {
    //Change the cache
    if (cache.has(`${payload.hostname}-services`)) {
      const services = cache.get<ServiceModel[]>(
        `${payload.hostname}-services`,
      )!;
      const cachedServiceIndex = services.findIndex((v) => {
        return v.name === service.name;
      });

      if (cachedServiceIndex > -1) {
        services[cachedServiceIndex] = service;
        cache.put(`${payload.hostname}-services`, services);
      }
    }
  }

  ctx.response.body = service;
});

router.post("/api/command", async (ctx) => {
  const payload: WinRMPayload = getPayload(ctx.request.url.searchParams);
  const req = await ctx.request.body.json();
  const res = await executeCommand(
    payload,
    req.command,
    req.isPowerShell,
  );
  ctx.response.body = res;
});

const app = new Application();
let wwwRoot: string | undefined = undefined;

app.use(async (ctx, next) => {
  await next();
  logging.logRequest(`${ctx.request.method} ${ctx.request.url.pathname}`);
});

app.use(oakCors()); // Enable CORS for All Routes
app.use(router.allowedMethods());
app.use(router.routes());

app.use(async (context, next) => {
  try {
    if (wwwRoot === undefined) {
      wwwRoot = await getWwwRoot();
    }
    await context.send({
      root: wwwRoot,
      index: "index.html",
    });
  } catch {
    await next();
  }
});

logging.info("Listening to http://localhost:8001");
logging.info("Press Ctrl+C to exit...");

await app.listen({ port: 8001 });

async function handleService(ctx: ContextApiName, payload: WinRMPayload) {
  const services = await cache.getObject<ServiceModel[]>(
    `${payload.hostname}-services`,
    async () => {
      return await getServices(payload);
    },
  );

  ctx.response.body = services;
}

async function handleDependencies(ctx: ContextApiName, payload: WinRMPayload) {
  const deps = await cache.getObject<DependenciesModel[]>(
    `${payload.hostname}-dependencies`,
    async () => {
      return await getDependsServices(payload);
    },
  );
  ctx.response.body = deps;
}

async function handleSystem(ctx: ContextApiName, payload: WinRMPayload) {
  const system = await cache.getObject<SystemModel>(
    `${payload.hostname}-system-info`,
    async () => {
      return await getSystem(payload);
    },
  );
  ctx.response.body = system;
}

async function handleProcess(ctx: ContextApiName, payload: WinRMPayload) {
  const processes = await getProcesses(payload);
  ctx.response.body = processes;
}

async function handlePerfmon(ctx: ContextApiName, payload: WinRMPayload) {
  const perfmon = await getPerfmon(payload);
  ctx.response.body = perfmon;
}

async function handleDevice(ctx: ContextApiName, payload: WinRMPayload) {
  const devices = await getDevices(payload);
  ctx.response.body = devices;
}

async function handleUsers(ctx: ContextApiName, payload: WinRMPayload) {
  const users = await cache.getObject<UserModel[]>(
    `${payload.hostname}-users`,
    async () => {
      return await getUsers(payload);
    },
  );
  ctx.response.body = users;
}

async function handleGroups(ctx: ContextApiName, payload: WinRMPayload) {
  const groups = await cache.getObject<GroupModel[]>(
    `${payload.hostname}-groups`,
    async () => {
      return await getGroups(payload);
    },
  );
  ctx.response.body = groups;
}

function getPayload(searchParams: URLSearchParams): WinRMPayload {
  return {
    username: searchParams.get("username")!,
    password: searchParams.get("password")!,
    protocol: searchParams.get("protocol")!,
    hostname: searchParams.get("hostname")!,
    port: Number(searchParams.get("port")!),
  };
}

async function getWwwRoot(): Promise<string> {
  const wwwRoot = join(getDenoDir(), "denoman/wwwroot");
  const ex = await exists(wwwRoot);
  if (!ex) {
    // Ensure directory
    await ensureDir(wwwRoot);
  }
  return wwwRoot;
}

function getDenoDir(): string {
  const os = Deno.build.os;
  const homeKey: string = os === "windows" ? "USERPROFILE" : "HOME";
  const homeDir = Deno.env.get(homeKey);
  let relativeDir = "";

  switch (os) {
    case "windows":
      relativeDir = "AppData/Local/deno";
      break;
    case "linux":
      relativeDir = ".cache/deno";
      break;
    case "darwin":
      relativeDir = "Library/Caches/deno";
      break;
  }

  if (homeDir === undefined) {
    return "";
  } else {
    return join(homeDir, relativeDir);
  }
}
