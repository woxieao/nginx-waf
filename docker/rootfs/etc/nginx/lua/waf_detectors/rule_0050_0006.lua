
			local function mainFunc()
			local success, result = pcall(function()
				local function ruleLogic()
					 local args = ngx.req.get_uri_args()
local test_param = args["cc"]
if test_param == 'hack' then
    return true;
else
    return false;
end

				end
				local match = ruleLogic();
				ngx.shared.exec_counter:incr('r_6', 1)
				if match == true then
					ngx.shared.block_counter:incr('r_6', 1);
					ngx.header["Intercepted"]=6;
					ngx.ctx.waf_intercepted_id=6;
					ngx.ctx.waf_intercepted_name='cc_demo';
					ngx.ctx.waf_intercepted_block_type='cc-attack';

					ngx.exit(ngx.HTTP_FORBIDDEN)
				end				
			end)
		
			if not success then ngx.header["rule_6"] = "exec failed"; end
		end
		return mainFunc
			