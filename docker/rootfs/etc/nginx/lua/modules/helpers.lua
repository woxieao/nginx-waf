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

function helpers.arr_contains(request_arr, matches_arr)
    ngx.say(1)
    for id, request_arg in pairs(request_arr) do
        ngx.say(2)
        ngx.say(id)
        ngx.say(3)
        ngx.say(request_arg)
        ngx.say(4)
        if request_arg ~= nil then
            request_arg = string.lower(request_arg)

            for _, match in ipairs(matches_arr) do
                if string.find(request_arg, match, 1, true) ~= nil then
                    return true
                end
            end
        end
    end
    ngx.say(5)
    return false
end

return helpers;
