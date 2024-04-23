local function mainBody()

    function listLuaFiles(folder_path)
        local files = {}
        local dir = io.popen("ls -v " .. folder_path)
        for file in dir:lines() do
            if file:match("%.lua$") then 
                table.insert(files, file) 
            end
        end
        dir:close()
        return files
    end

    local files = listLuaFiles("/etc/nginx/lua/waf_detectors/")

    for _, moduleName in ipairs(files) do
        local module = require(moduleName:sub(1, -5))
        module()
    end
end
return mainBody;
