local lfs = require("lfs")

-- 指定要读取的目录路径
local directory_path = "/etc/nginx/lua/block_logic"

-- 遍历目录中的文件
for file in lfs.dir(directory_path) do
    -- 拼接文件的完整路径
    local full_path = directory_path .. "/" .. file

    -- 检查文件是否是 Lua 脚本
    if file:match("%.lua$") and lfs.attributes(full_path, "mode") == "file" then
        -- 加载并执行 Lua 脚本
        local chunk, err = loadfile(full_path)
        if chunk then
            print("Executing script:", file)
            chunk()
        else
            print("Error loading script:", err)
        end
    end
end
