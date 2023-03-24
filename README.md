# ROBLOX Connect

A VSCode extension that lets you connect to ROBLOX and run scripts, with output and error logs.

Link: [https://marketplace.visualstudio.com/items?itemName=nitro.robloxconnect](https://marketplace.visualstudio.com/items?itemName=nitro.robloxconnect)

Recommended to use with [Roblox LSP](https://marketplace.visualstudio.com/items?itemName=Nightrains.robloxlsp) for intellisense.

## Features

- Properly made and coded, compared to others
- Button to run the current open file (on the bottom left of VSCode)
- Output window for errors and logs from ROBLOX (CTRL + SHIFT + U, select "ROBLOX Connect" on the dropdown)
- Supports multiple clients (once more than one client is connected, you can select which client to run scripts on)
- Supports selecting multiple files to run on the context menu (right click on file(s))
- Supports Synapse X and Script-Ware V2 (and probably other injectors/exploits that support WebSockets)

## Lua code

You need the script below for your game to connect to the extension, you can put this in your autoexec folder.

```lua
loadstring(game:HttpGet('https://raw.githubusercontent.com/nitrog0d/ROBLOXConnect/master/src/robloxconnect.lua'))()
```
