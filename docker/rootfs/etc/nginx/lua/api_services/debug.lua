local str2Append = ngx.var.arg_str2Append or "0123456789"
local keyName = "testKey"
local existingData = ngx.shared.debug_dict:get(keyName) or ""

ngx.shared.debug_dict:set(keyName, existingData .. str2Append)
ngx.say(ngx.shared.debug_dict:get(keyName))
