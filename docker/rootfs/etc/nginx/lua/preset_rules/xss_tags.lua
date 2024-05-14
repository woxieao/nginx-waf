local pattern = "<[\\s]*(iframe|script|body|img|layer|div|meta|style|base|object|input)";
local args = ngx.req.get_uri_args();
ngx.req.read_body()
local body_data = ngx.req.get_body_data()


for id, request_arg in pairs(args) do
    local captures, _ = ngx.re.match(request_arg, pattern, "jo")
    if captures then
        return true;
    end
end
local body_captures, _ = ngx.re.match(body_data, pattern, "jo")
if body_captures then
    return true;
end

return false
