# denoman

DenoMan is a comprehensive web application designed specifically for managing Windows computers and servers. With features like Service Manager, Dashboard, and PerfMon, DenoMan offers a complete solution for monitoring and managing your systems.

What makes DenoMan stand out? It's built using the power of Deno and Vue.js with the Quasar framework, bringing you a modern and efficient solution for system management. Plus, everything is tightly integrated with Deno, ensuring a seamless experience.


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
deno run -A --reload https://deno.land/x/denoman/mod.ts
```

## Screenshots

Together, let's make DenoMan the go-to solution for managing Windows systems with Deno.
