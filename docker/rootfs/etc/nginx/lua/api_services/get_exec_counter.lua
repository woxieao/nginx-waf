
ngx.say('666')
if ngx.shared.exec_counter ~= nil then
    local rule_id = ngx.var.arg_rule_id;
    ngx.say(ngx.shared.exec_counter:get('r_' .. rule_id))
else
    ngx.say('0')
end
