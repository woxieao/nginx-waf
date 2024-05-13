--限制请求报文大小为50m以内
local max_body_length = 50 * 1024 * 1024;
local headers = ngx.req.get_headers()
local content_length = tonumber(headers["content-length"] or 0)

if content_length > max_body_length then
    ngx.ctx.status_code = 413; --HTTP_REQUEST_ENTITY_TOO_LARGE
    return true;
end
return false;
