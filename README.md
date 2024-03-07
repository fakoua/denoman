# denoman
[![denoman deno](https://github.com/fakoua/denoman/actions/workflows/deno.yml/badge.svg)](https://github.com/fakoua/denoman)
[![jsr.io/@fakoua/denoman](https://jsr.io/badges/@fakoua/denoman)](https://jsr.io/@fakoua/denoman)
[![jsr.io/@fakoua/denoman score](https://jsr.io/badges/@fakoua/denoman/score)](https://jsr.io/@fakoua/denoman)
[![deno.land/x/denoman](https://deno.land/badge/denoman/version)](https://deno.land/x/denoman)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=bugs)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=coverage)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=fakoua_denoman&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=fakoua_denoman)

[Check how to Run](#Run)

DenoMan is a comprehensive web application designed specifically for managing
Windows computers and servers. With features like Service Manager, Dashboard,
and PerfMon, DenoMan offers a complete solution for monitoring and managing your
systems.

What makes DenoMan stand out? It's built using the power of Deno and Vue.js with
the Quasar framework, bringing you a modern and efficient solution for system
management. Plus, everything is tightly integrated with Deno, ensuring a
seamless experience.

## Enable WinRM

On the remote host, launch PowerShell prompt, using the **Run as Administrator**
option and run the following commands:

```ps
winrm quickconfig
winrm set winrm/config/service/Auth '@{Basic="true"}'
winrm set winrm/config/service '@{AllowUnencrypted="true"}'
winrm set winrm/config/winrs '@{MaxMemoryPerShellMB="1024"}'
```

## Run

Run the following command and see the magic!

```ps
deno run -A jsr:@fakoua/denoman
```

Or

```ps
deno run -A --reload https://deno.land/x/denoman/mod.ts
```

For logging:

```
deno run -A jsr:@fakoua/denoman --log-request --level=debug
```

- **--log-request**: to trace all the requests on the console (recommended for
  debuging)
- **--level**: to log the actions and functions (debug, info, warn, error,
  critical). default is 'info'

## Screenshots

![DenoMan Dashboard](https://github.com/fakoua/denoman/blob/main/resources/ss01.png?raw=true)

![DenoMan PerfMon](https://github.com/fakoua/denoman/blob/main/resources/ss02.png?raw=true)

![DenoMan Service Manager](https://github.com/fakoua/denoman/blob/main/resources/ss03.png?raw=true)

Together, let's make DenoMan the go-to solution for managing Windows systems
with Deno.
