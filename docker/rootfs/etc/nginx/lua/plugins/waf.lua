local function mainBody()

    function listLuaFiles(folder_path)
        local files = {}
        local dir = io.popen("ls " .. folder_path)  -- 使用ls命令列出文件夹中的所有文件
        for file in dir:lines() do
            if file:match("%.lua$") then  -- 判断文件是否以.lua结尾
                table.insert(files, file)  -- 将符合条件的文件名添加到数组中
            end
        end
        dir:close()
        return files
    end

    local files = listLuaFiles("/etc/nginx/lua/waf_detectors/")

    local str = "";
    local array = {10, 20, 30}
    for _, value in ipairs(files) do str = str .. value .. "|"; end
    ngx.say(str);
end
return mainBody;
