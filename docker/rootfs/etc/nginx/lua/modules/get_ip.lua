local function get_client_ip()
    return ngx.var.remote_addr;
    -- return ngx.var.http_x_forwarded_for;
    -- return ngx.var.http_x_real_ip;
end
return get_client_ip;