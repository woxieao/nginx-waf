
			local function mainFunc()
			local success, result = pcall(function()
				local function ruleLogic()
					 2
				end
				local match = ruleLogic();
				ngx.shared.exec_counter:incr('r_5', 1)
				if match == true then
					ngx.shared.block_counter:incr('r_5', 1);
					ngx.header["Intercepted"]=5;
					ngx.ctx.waf_intercepted_id=5;
					ngx.ctx.waf_intercepted_name='22-1-2';
					ngx.ctx.waf_intercepted_block_type='others';

					ngx.exit(ngx.HTTP_FORBIDDEN)
				end				
			end)
		
			if not success then ngx.header["rule_5"] = "exec failed"; end
		end
		return mainFunc
			