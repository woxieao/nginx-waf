local pattern = "<[\\s]*(iframe|script|body|img|layer|div|meta|style|base|object|input)";
local str = ngx.req.get_uri_args()['test'];
local arg = ngx.re.match(str, pattern, 'jo');

ngx.say("start")
if arg then
    ngx.say(arg)
else
    ngx.say("not matched")
end
