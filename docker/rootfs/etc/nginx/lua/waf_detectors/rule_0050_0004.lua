
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
				if ngx.shared.exec_counter:get('r_4') == nil then
               		ngx.shared.exec_counter:add('r_4', 0)
            	end
				if match == true then
				if ngx.shared.block_counter:get('r_4') == nil then
					ngx.shared.block_counter:add('r_4', 0);
			 	end
					ngx.shared.block_counter:incr('r_4', 1);
					ngx.header["Intercepted"]=4;
					ngx.ctx.waf_intercepted_id=4;
					ngx.ctx.waf_intercepted_name='cc_demo';
					ngx.ctx.waf_intercepted_block_type='cc-attack';

					ngx.exit(ngx.HTTP_FORBIDDEN)
				end				
			end)
		
			if not success then ngx.header["rule_4"] = "exec failed"; end
		end
		return mainFunc
			