local helpers = require "helpers";

local dict_counter = require "dict_counter";
local ip_recorder = {};
local dict = ngx.shared.ip_log_data;
function ip_recorder.incr(type, time)
    return dict_counter.incr_counter(dict, type .. "_" .. helpers.get_client_ip(), time)
end

function ip_recorder.get_ip_request_count(type)
    return dict:get(type, type .. "_" .. helpers.get_client_ip()) or 0;
end

return ip_recorder;
