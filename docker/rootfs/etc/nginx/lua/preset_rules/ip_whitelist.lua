--ip白名单
local whitelist_ips = {
    "111.111.111.111", "222.222.222.222"
    -- 添加其他直接放行的IP地址
}
local helpers = require "helpers"
local client_ip = helpers.get_client_ip()
for _, white_ip in ipairs(whitelist_ips) do
    if client_ip == white_ip then
        ngx.ctx.trust_request = true;
        return false;
    end
end
return false
