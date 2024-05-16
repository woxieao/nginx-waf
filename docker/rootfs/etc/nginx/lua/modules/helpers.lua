local helpers = {};
function helpers.get_client_ip()
    return ngx.var.remote_addr;
    -- return ngx.var.http_x_forwarded_for;
    -- return ngx.var.http_x_real_ip;
end

function helpers.get_current_time() return os.time() + 60 * 60 * 8; end

function helpers.get_current_time_str(time)
    return os.date("%Y%m%d%H%M%S", time or helpers.get_current_time())
end

function helpers.reg_match(input, pattern)
    local captures, _ = ngx.re.match(input, pattern, "joi")
    if captures then
        return true;
    end
    return false
end

function helpers.reg_match_list(input_list, pattern)
    for _, input in ipairs(input_list) do
        if helpers.reg_match(input, pattern) then
            return true;
        end
    end
    return false;
end

function helpers.get_all_request_input_string()
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

    return str_list;
end

return helpers;
