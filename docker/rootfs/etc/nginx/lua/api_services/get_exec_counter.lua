if ngx.shared.exec_counter ~= nil then
    local rule_id = ngx.var.arg_rule_id;
    local count = ngx.shared.exec_counter:get('r_' .. rule_id)
    ngx.say(rule_id)
    if count == nil then
        ngx.say(0)
    else
        ngx.say(count)
    end

else
    ngx.say(0)
end
