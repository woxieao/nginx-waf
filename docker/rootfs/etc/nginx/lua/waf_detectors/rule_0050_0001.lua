
			local function mainFunc()
			local function ruleLogic() 
				local args = ngx.req.get_uri_args()
local test_param = args["test"]
if test_param == 'block' then
    return true;
else
    return false;
end

			end
			local match = ruleLogic();
			if ngx.shared.exec_counter:get('r_1') == nil then
               ngx.shared.exec_counter:set('r_1', 0)
            end
			ngx.shared.exec_counter:incr('r_1', 1)
			if match == true then
			if ngx.shared.block_counter:get('r_1') == nil then
               ngx.shared.block_counter:set('r_1', 0)
            end
				ngx.shared.block_counter:incr('r_1', 1);				
				ngx.header["Intercepted"]=1;
				ngx.ctx.waf_intercepted_id=1;
				ngx.ctx.waf_intercepted_name='url_demo';
				ngx.ctx.waf_intercepted_block_type='others';
				ngx.exit(ngx.HTTP_FORBIDDEN)
			end			
		end
		return mainFunc
		