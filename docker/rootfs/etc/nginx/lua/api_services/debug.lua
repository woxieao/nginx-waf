ngx.shared.debug_dict:set("test", 1, 10)
ngx.shared.debug_dict:incr("test", 1)
ngx.say(ngx.shared.debug_dict:get("test"))
