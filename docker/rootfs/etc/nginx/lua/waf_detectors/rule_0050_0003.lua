
			local function mainFunc()
			local function ruleLogic() 
				ngx.header["Hello"] = "World!"
return false;

			end
			local match = ruleLogic();
			if ngx.shared.exec_counter:get('r_3') == nil then
               ngx.shared.exec_counter:set('r_3', 0)
            end
			ngx.shared.exec_counter:incr('r_3', 1)
			if match == true then
			if ngx.shared.block_counter:get('r_3') == nil then
               ngx.shared.block_counter:set('r_3', 0)
            end
				ngx.shared.block_counter:incr('r_3', 1);				
				ngx.header["Intercepted"]=3;
				ngx.ctx.waf_intercepted_id=3;
				ngx.ctx.waf_intercepted_name='hello_world';
				ngx.ctx.waf_intercepted_block_type='others';
				ngx.exit(ngx.HTTP_FORBIDDEN)
			end			
		end
		return mainFunc
		