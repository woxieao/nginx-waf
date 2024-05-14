local cjson = require "cjson";
local pattern = "<[\\s]*(iframe|script|body|img|layer|div|meta|style|base|object|input)";
local str = ngx.req.get_uri_args()['test'];

local captures, err = ngx.re.match(str, pattern, "jo")

ngx.say("start")
if captures then
    ngx.say(cjson.encode(captures))
else
    ngx.say("not matched")
end
