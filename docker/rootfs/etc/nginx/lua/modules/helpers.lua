local helpers = {};
function helpers.get_client_ip()
    return ngx.var.remote_addr;
    -- return ngx.var.http_x_forwarded_for;
    -- return ngx.var.http_x_real_ip;
end

function helpers.get_current_time() return os.time() + 60 * 60 * 8; end
function helpers.get_current_time_str()
    return os.date("%Y%m%d%H%M%S", helpers.get_current_time())
end
return helpers;
