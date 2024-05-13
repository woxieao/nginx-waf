local args = ngx.req.get_uri_args()

local pattern =
[=[(/\\*!?|\\*/|[';]--|--[\\s\\r\\n\\v\\f]|(?:--[^-]*?-)|([^\\-&])#.*?[\\s\\r\\n\\v\\f]|;?\\\\x00)=]=];

for _, value in pairs(args) do
    
    if ngx.re.match(value, pattern, "jo") then
        return true;
    end
    return false
end
