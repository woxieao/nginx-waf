local function mainBody()

    function list_lua_files(path)
        local cmd = 'find "' .. path .. '" -type f -name "*.lua"'
        local handle = io.popen(cmd)
        local result = handle:read("*a")
        handle:close()
        return result
    end

    local files = list_lua_files("/etc/nginx/lua/waf_detectors/")

    local str = "";
    local array = {10, 20, 30}
    for _, value in ipairs(files) do str = str .. value .. "|"; end
    ngx.say(str);
end
return mainBody;
