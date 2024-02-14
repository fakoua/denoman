# denoman

Windows Services Manager by Deno!

# Enable WinRM

On the remote host, launch PowerShell prompt, using the **Run as Administrator**
option and run the following commands:

```ps
winrm quickconfig
winrm set winrm/config/service/Auth '@{Basic="true"}'
winrm set winrm/config/service '@{AllowUnencrypted="true"}'
winrm set winrm/config/winrs '@{MaxMemoryPerShellMB="1024"}'
```

# Run

Run the following command and see the magic!

```ps
deno run -A --reload https://deno.land/x/denoman/mod.ts
```
