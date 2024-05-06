local str2Append = ngx.var.arg_str2Append;
if str2Append == nil then str2Append = "1023456789"; end
local keyName = "testKey";
local existingData = ngx.shared.debug_dict:get(keyName);
if existingData == nil then existingData = "" end

ngx.shared.debug_dict.set(keyName, existingData .. keyName);
ngx.say(ngx.shared.debug_dict:get(keyName));
