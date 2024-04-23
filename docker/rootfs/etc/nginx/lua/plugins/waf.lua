local function mainBody()
    function listLuaFiles(folder_path)
        local shared_data = ngx.shared.shared_data
        local waf_detectors_key_name = "waf_detectors";
        if shared_data == nil then
            local cjson = require "cjson";
            local files = {}
            local dir = io.popen("ls -v " .. folder_path)
            for file in dir:lines() do
                if file:match("%.lua$") then
                    table.insert(files, file)
                end
            end
            dir:close()
            shared_data:set(waf_detectors_key_name, cjson.encode(files))
            return files;
        else
            return cjson.decode(shared_data:get(waf_detectors_key_name));
        end
    end
    -- 加载的模块会被缓存
    local files = listLuaFiles("/etc/nginx/lua/waf_detectors/")

    for _, moduleName in ipairs(files) do
        local module = require(moduleName:sub(1, -5))
        module()
    end
end
return mainBody;
