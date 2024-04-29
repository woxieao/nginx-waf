if ngx.shared.debug_dict ~= nil then
    ngx.say(ngx.shared.debug_dict:get("counter"))
end
