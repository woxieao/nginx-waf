local rule_id = ngx.var.arg_rule_id;
local key_name = 'r_' .. rule_id;

local function get_exec_counter()
    if ngx.shared.exec_counter ~= nil then
        local count = ngx.shared.exec_counter:get(key_name);

        if count == nil then
            return 0;
        else
            -- Get the latest counter and reset it to zero
            ngx.shared.exec_counter:incr(key_name, -count);
            return count;
        end
    else
        return 0;
    end
end

local function get_block_counter()
    if ngx.shared.block_counter ~= nil then
        local count = ngx.shared.block_counter:get(key_name);

        if count == nil then
            return 0;
        else
            -- Get the latest counter and reset it to zero
            ngx.shared.block_counter:incr(key_name, -count);
            return count;
        end
    else
        return 0;
    end
end

local cjson = require "cjson";

ngx.header.content_type = "application/json; charset=utf-8"
ngx.say(cjson.encode({
    exec_counter = get_exec_counter(),
    block_counter = get_block_counter()
}));

