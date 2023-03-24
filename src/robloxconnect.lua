if not game:IsLoaded() then
  game.Loaded:Wait()
end

local HttpService = game:GetService("HttpService")
local WebSocketInstance = nil

game:GetService("LogService").MessageOut:Connect(function(message, messageType)
  if WebSocketInstance then
    WebSocketInstance:Send(HttpService:JSONEncode({
      type = "log",
      data = {
        message = message,
        type = messageType.Value
      }
    }))
  end
end)

game:GetService("ScriptContext").ErrorDetailed:Connect(function(message, stackTrace, script, details, securityLevel)
  if WebSocketInstance then
    WebSocketInstance:Send(HttpService:JSONEncode({
      type = "detailed_error",
      data = {
        message = message,
        stackTrace = stackTrace,
        details = details,
        securityLevel = securityLevel,
      }
    }))
  end
end)

task.spawn(function()
  while task.wait(1) do
    pcall(function()
      WebSocketInstance = ((syn and syn.websocket) or WebSocket).connect("ws://localhost:42121")

      local localPlayer = game:GetService("Players").LocalPlayer
      WebSocketInstance:Send(HttpService:JSONEncode({
        type = "connect",
        data = {
          displayName = localPlayer.DisplayName,
          name = localPlayer.Name
        }
      }))

      WebSocketInstance.OnMessage:Connect(function(msg)
        local json = HttpService:JSONDecode(msg)
        if json.type == "run_luas" then
          for _, lua in pairs(json.data.luas) do
            loadstring(lua)()
          end
        end
      end)

      WebSocketInstance.OnClose:Wait()
      WebSocketInstance = nil
    end)
  end
end)
