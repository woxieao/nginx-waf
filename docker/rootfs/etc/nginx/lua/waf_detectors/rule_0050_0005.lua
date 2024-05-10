
			local function mainFunc()
			local success, result = pcall(function()
				local function ruleLogic()
					 local blacklist_ips = {
    "111.111.111.111", "222.222.222.222"
    -- 添加其他需要加入黑名单的IP地址
}
local client_ip = ngx.var.remote_addr
for _, black_ip in ipairs(blacklist_ips) do
    if black_ip == client_ip then return true end
end
return false

				end
				local match = ruleLogic();
				ngx.shared.exec_counter:incr('r_5', 1)
				if match == true then
					ngx.shared.block_counter:incr('r_5', 1);
					ngx.header["Intercepted"]=5;
					ngx.ctx.waf_intercepted_id=5;
					ngx.ctx.waf_intercepted_name='ip_blacklist_demo2';
					ngx.ctx.waf_intercepted_block_type='others';

					ngx.exit(ngx.HTTP_FORBIDDEN)
				end				
			end)
		
			if not success then ngx.header["rule_5"] = "exec failed"; end
		end
		return mainFunc
			