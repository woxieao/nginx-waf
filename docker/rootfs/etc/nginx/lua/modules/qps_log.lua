local qps_key_prefix = "0_";

local dict_counter = require "dict_counter";
local cjson = require "cjson";
local qps_log = {}
local dict = ngx.shared.qps_log_data;

function qps_log.log_request()
    dict_counter.incr_counter(dict, qps_key_prefix .. os.time())
end
function qps_log.log2json(start_time, end_time)
    local result = {};
    for i = start_time, end_time do
        result[i] = dict:get(qps_key_prefix .. i) or 0;
        ngx.say(qps_key_prefix .. i, dict:get(qps_key_prefix .. i) or 0)
    end
    --return cjson.encode(result);
end
return qps_log;
