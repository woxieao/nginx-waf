local blacklist_ips = {
    "111.111.111.111", "222.222.222.222"
    -- 添加其他需要加入黑名单的IP地址
}
local helpers = require "helpers"
local client_ip = helpers.get_client_ip()
for _, black_ip in ipairs(blacklist_ips) do
    if black_ip == client_ip then return true end
end
return false
