local blacklist_ips = {
    "111.111.111.111", "222.222.222.222"
    -- 添加其他需要加入黑名单的IP地址
}
local client_ip = ngx.var.remote_addr
for _, black_ip in ipairs(blacklist_ips) do
    if black_ip == client_ip then return true end
end
return false
