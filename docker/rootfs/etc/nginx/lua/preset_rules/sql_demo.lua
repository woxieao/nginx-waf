local args = ngx.req.get_uri_args()
local test_param = args["sql"]
if test_param == 'hack' then
    return true;
else
    return false;
end
