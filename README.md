# ROBLOX Connect

A VSCode extension that lets you connect to ROBLOX and run scripts, with output and error logs.

## Features

- Properly made and coded, compared to others
- Supports Synapse X and Script-Ware V2 (and probably other injectors/exploits that support WebSockets)
- Supports multiple clients (if for some reason you need that)
- Supports selecting multiple files to run on the context menu (right click on file(s))

## Lua code

You need the script below for your game to connect to the extension, you can put this in your autoexec folder.

```lua
loadstring(game:HttpGet('https://raw.githubusercontent.com/nitrog0d/ROBLOXConnect/master/src/robloxconnect.lua'))()
```
