ngx.header["xa"] = "test"
local function mainBody()
    local moduleNames = {}
    local dir = io.popen("ls -v /etc/nginx/lua/waf_detectors/")
    for file in dir:lines() do
        if file:match("%.lua$") then
            table.insert(moduleNames, file:sub(1, -5))
        end
    end
    dir:close()

    for _, moduleName in ipairs(moduleNames) do
        ngx.header[moduleName] = "1"
        local module = require(moduleName)
        module()
    end
end
return mainBody;
