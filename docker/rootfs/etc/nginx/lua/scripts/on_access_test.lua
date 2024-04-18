local cjson = require("cjson")

-- 指定要读取的 JSON 文件路径
local json_file_path = "/etc/nginx/lua/configs/lua_list.json"

-- 读取 JSON 文件内容
local file = io.open(json_file_path, "r")
if file then
    local json_data = file:read("*a")
    file:close()

    -- 反序列化 JSON 数据
    local decoded_data = cjson.decode(json_data)

    for i, value in ipairs(decoded_data) do
        ngx.say(cjson.encode(value) .. "\n")
    end

else
    print("Error opening JSON file")
end
