--特殊路径白名单
local whitelist_paths = {
    "/the_trusted_path_0",
    "/the_trusted_path_1"
    -- 添加其他直接放行的路径地址
}

for _, white_path in ipairs(whitelist_paths) do
    if ngx.var.uri == white_path then
        ngx.ctx.trust_request = true;
        return false;
    end
end
return false
