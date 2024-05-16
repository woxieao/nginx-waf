local ip_recorder = require "ip_recorder"
if ip_recorder.get_ip_request_count("m") < 1000 and ip_recorder.get_ip_request_count("h") < 10000 then
   ngx.say(1)
end
ngx.say(2)
