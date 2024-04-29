if ngx.shared.debug_dict:get("counter") == nil then
    ngx.shared.debug_dict:set("counter", 0)
end
ngx.shared.debug_dict:incr("counter", 1)
