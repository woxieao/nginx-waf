local qps_second_key_prefix = "0_";
local qps_second_key_prefix = "0_";

local dict_counter = require "dict_counter";
local cjson = require "cjson";
local qps_log = {}
local dict = ngx.shared.qps_log_data;

function qps_log.log_request()
    local timestamp = os.time();
    local secondTimestamp = os.date("%Y%m%d%H%M%S", timestamp);
    dict_counter.incr_counter(dict, qps_second_key_prefix .. secondTimestamp)
end
function qps_log.log2json(start_time, end_time)

    local timestamp = os.time();
    local secondTimestamp = os.date("%Y%m%d%H%M%S", timestamp);
    ngx.say(secondTimestamp);

    local result = {qps = {}, qpm = {}, qph = {}, qpd = {}};
    for i = start_time, end_time do
        result.qps[tostring(i)] = (dict:get(qps_second_key_prefix .. i) or 0);
    end
    return cjson.encode(result);
end
return qps_log;

