local ip_recorder = require "ip_recorder"
--键保存时长,单位是秒
local cache_seconds = 60;
--允许最大的请求数,超过该阈值则拦截
local max_request_count = 600;
--
if ip_recorder.incr(cache_seconds) > max_request_count then
    ngx.ctx.status_code = 429;
    return true;
end
return false;
