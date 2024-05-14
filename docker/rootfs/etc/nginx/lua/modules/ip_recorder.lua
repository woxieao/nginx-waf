local helpers = require "helpers";

local dict_counter = require "dict_counter";
local ip_recorder = {};
local dict = ngx.shared.ip_log_data;
function ip_recorder.incr(time)
    return dict_counter.incr_counter(dict, helpers.get_client_ip(), time)
end

return ip_recorder;
