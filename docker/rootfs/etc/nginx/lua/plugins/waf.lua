local function mainBody()
    local function listLuaModules(folderPath)
        local sharedData = ngx.shared.local_cache
        local wafDetectorsKeyName = "waf_detectors_list";
        local cjson = require "cjson";
        local moduleNames = sharedData:get(wafDetectorsKeyName);
        if moduleNames == nil then
            moduleNames = {}
            local dir = io.popen("ls -v " .. folderPath)
            for file in dir:lines() do
                if file:match("%.lua$") then
                    table.insert(moduleNames, file:sub(1, -5))
                end
            end
            dir:close()
            sharedData:add(wafDetectorsKeyName, cjson.encode(moduleNames))
            return moduleNames;
        else
            return cjson.decode(moduleNames);
        end
    end
    -- 加载的模块会被缓存
    local files = listLuaModules("/etc/nginx/lua/waf_detectors/")

    for _, moduleName in ipairs(files) do
        local module = require(moduleName)
        module()
    end
end
return mainBody;
