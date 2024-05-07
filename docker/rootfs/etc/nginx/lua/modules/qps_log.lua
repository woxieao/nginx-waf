local qps_key_prefix = "0_";

local dict_counter = require "dict_counter";
local qps_log = {}
local dict = ngx.shared.qps_log_data;

function qps_log.log_request()
    dict_counter.incr_counter(dict, qps_key_prefix .. os.time())
end

return qps_log;
