-- local cjson = require("cjson")

-- local json_file_path = "/etc/nginx/lua/waf_detectors/lua_list.json"

-- local file = io.open(json_file_path, "r")
-- if file then
--     local json_data = file:read("*a")
--     file:close()
--     local decoded_data = cjson.decode(json_data)

--     for i, luaInfo in ipairs(decoded_data) do

--         if luaInfo.isEnable then
--             local lua_func, err = loadstring(luaInfo.script)
--             lua_func();
--         end
--     end

-- end
