import { join } from "https://deno.land/std@0.213.0/path/join.ts";
import { exists } from "https://deno.land/std@0.213.0/fs/exists.ts";
import { ensureDir } from "https://deno.land/std@0.213.0/fs/ensure_dir.ts";

import { Application, Router } from "https://deno.land/x/oak@v13.0.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { actions, getDependsServices, getServices } from "./src/services.ts";
import { getSystem } from "./src/system.ts";
import * as cache from "./src/memcache.ts";
import {
  DependenciesModel,
  ServiceModel,
  SystemModel,
  WinRMPayload,
} from "./src/models.ts";
import { initServer } from "./build-tools/binToTs.ts";


await initServer(await getWwwRoot());

const router = new Router();

router.get("/api/:apiName", async (ctx) => {
  const payload: WinRMPayload = {
    username: ctx.request.url.searchParams.get("username")!,
    password: ctx.request.url.searchParams.get("password")!,
    protocol: (ctx.request.url.searchParams.get("protocol")!),
    host: ctx.request.url.searchParams.get("host")!,
    port: Number(ctx.request.url.searchParams.get("port")!),
  };

  if (ctx.params.apiName === "service") {
    let services: Array<ServiceModel>;
    if (cache.has("services")) {
      services = cache.get("services")!;
    } else {
      services = await getServices(payload);
      cache.put("services", services);
    }
    ctx.response.body = services;
  }

  if (ctx.params.apiName === "dependencies") {
    let deps: Array<DependenciesModel>;
    if (cache.has("dependencies")) {
      deps = cache.get("dependencies")!;
    } else {
      deps = await getDependsServices(payload);
      cache.put("dependencies", deps);
    }
    ctx.response.body = deps;
  }

  if (ctx.params.apiName === "system") {
    let system: SystemModel;

    if (cache.has("system-info")) {
      system = cache.get("system-info")!;
    } else {
      system = await getSystem(payload);
      cache.put("system-info", system);
    }

    ctx.response.body = system;
  }
});

router.post("/api/service", async (ctx) => {
  const payload: WinRMPayload = {
    username: ctx.request.url.searchParams.get("username")!,
    password: ctx.request.url.searchParams.get("password")!,
    protocol: (ctx.request.url.searchParams.get("protocol")!),
    host: ctx.request.url.searchParams.get("host")!,
    port: Number(ctx.request.url.searchParams.get("port")!),
  };

  const req = ctx.request.body({ type: "json" });
  const reqObj = await req.value;
  const service = await actions(reqObj.serviceName, reqObj.action, payload);

  if (service !== undefined) {
    //Change the cache
    if (cache.has("services")) {
      const services = cache.get<ServiceModel[]>("services")!;
      const cachedServiceIndex = services.findIndex((v) => {
        return v.name === service.name;
      });

      if (cachedServiceIndex > -1) {
        services[cachedServiceIndex] = service;
        cache.put("services", services);
      }
    }
  }

  ctx.response.body = service;
});

router.put("/api/service", (ctx) => {
  ctx.response.body = "Received a PUT HTTP method";
});

router.delete("/api/service", (ctx) => {
  ctx.response.body = "Received a DELETE HTTP method";
});

const app = new Application();
let wwwRoot: string | undefined = undefined;

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

console.log("Listening to http://localhost:8001");

await app.listen({ port: 8001 });

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
