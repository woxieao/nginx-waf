-- local rule_id = ngx.var.arg_rule_id;
-- local key_name = 'r_' .. rule_id;

-- local function get_exec_counter()
--     if ngx.shared.exec_counter ~= nil then
--         local count = ngx.shared.exec_counter:get(key_name);
--         -- Get the latest counter and reset it to zero
--         ngx.shared.exec_counter:incr(key_name, -count);
--         if count == nil then
--             return 0;
--         else

--             return count;
--         end

--     else
--         return 0;
--     end
-- end

-- local function get_block_counter()
--     if ngx.shared.block_counter ~= nil then
--         local count = ngx.shared.block_counter:get(key_name);
--         -- Get the latest counter and reset it to zero
--         ngx.shared.block_counter:incr(key_name, -count);
--         if count == nil then
--             return 0;
--         else

--             return count;
--         end

--     else
--         return 0;
--     end
-- end

-- local cjson = require "cjson";
-- local result = {}
-- result.exec_counter = get_exec_counter();
-- result.block_counter = get_block_counter();
-- ngx.say(cjson.encode(result));

ngx.say(1)