-- local cjson = require "cjson"
-- local main = {}

-- function main.ReadJsonFile(filePath)
--     local file = io.open(filePath, "r")

--     if file == nil then ngx.say("file not found") end

--     local data = file:read("*all");
--     file:close();

--     -- ngx.log(ngx.STDERR, data)
--     local tmp = cjson.decode(data)
--     if tmp ~= nil then
--         -- update config version if need
--         local loop = true
--         while loop do
--             local handle = main.version_updater[tmp['config_version']]
--             if handle ~= nil then
--                 tmp = handle(tmp)
--             else
--                 loop = false
--             end
--         end

--         if tmp['config_version'] ~= main["configs"]["config_version"] then
--             ngx.log(ngx.STDERR,
--                     "load config from config.json error,will use default config")
--             ngx.log(ngx.STDERR, "Except Version:")
--             ngx.log(ngx.STDERR, main["configs"]["config_version"])
--             ngx.log(ngx.STDERR, "Config.json Version:")
--             ngx.log(ngx.STDERR, tmp["config_version"])
--         else
--             main["configs"] = tmp
--         end

--         return json.encode({["ret"] = "success", ['config'] = main["configs"]})
--     else
--         ngx.log(ngx.STDERR, "config.json decode error")
--         return json.encode({
--             ["ret"] = "error",
--             ["msg"] = "config file decode error, will use default"
--         })
--     end

-- end

-- return main
