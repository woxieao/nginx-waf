
			local function mainFunc()
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
			if ngx.shared.exec_counter:get('r_2') == nil then
               ngx.shared.exec_counter:set('r_2', 0)
            end
			ngx.shared.exec_counter:incr('r_2', 1)
			if match == true then
			if ngx.shared.block_counter:get('r_2') == nil then
               ngx.shared.block_counter:set('r_2', 0)
            end
				ngx.shared.block_counter:incr('r_2', 1);				
				ngx.header["Intercepted"]=2;
				ngx.ctx.waf_intercepted_id=2;
				ngx.ctx.waf_intercepted_name='ip_blacklist_demo';
				ngx.ctx.waf_intercepted_block_type='others';
				ngx.exit(ngx.HTTP_FORBIDDEN)
			end			
		end
		return mainFunc
		