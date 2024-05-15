local cjson = require "cjson";
local str_list = {};

local args = ngx.req.get_uri_args();
for _, value in pairs(args) do
    table.insert(str_list, value);
end
local headers = ngx.req.get_headers();
for _, value in pairs(headers) do
    table.insert(str_list, value);
end
ngx.req.read_body()
table.insert(str_list, ngx.req.get_body_data());

ngx.say(cjson.encode(str_list));
