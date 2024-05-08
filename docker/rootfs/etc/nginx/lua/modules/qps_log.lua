local qps_second_key_prefix = "0_";
local qps_minute_key_prefix = "1_";
local qps_hour_key_prefix = "2_";
local qps_day_key_prefix = "3_";

local dict_counter = require "dict_counter";
local helpers = require "helpers";
local cjson = require "cjson";
local qps_log = {}
local dict = ngx.shared.qps_log_data;

function qps_log.log_request()

    local secondTimestamp = helpers.get_current_time_str();
    local minuteTimestamp = secondTimestamp.sub(1, -2);
    local hourTimestamp = secondTimestamp.sub(1, -4);
    local dayTimestamp = secondTimestamp.sub(1, -6);

    dict_counter.incr_counter(dict, qps_second_key_prefix .. secondTimestamp)
    dict_counter.incr_counter(dict, qps_minute_key_prefix .. minuteTimestamp)
    dict_counter.incr_counter(dict, qps_hour_key_prefix .. hourTimestamp)
    dict_counter.incr_counter(dict, qps_day_key_prefix .. dayTimestamp)
end
function qps_log.log2json(start_time, end_time)

    local secondTimestamp = helpers.get_current_time_str();
    local minuteTimestamp = secondTimestamp.sub(1, -2);
    local hourTimestamp = secondTimestamp.sub(1, -4);
    local dayTimestamp = secondTimestamp.sub(1, -6);

    ngx.say(secondTimestamp);

    ngx.say(minuteTimestamp);

    ngx.say(hourTimestamp);

    ngx.say(dayTimestamp);

    local result = {qps = {}, qpm = {}, qph = {}, qpd = {}};
    for i = start_time, end_time do
        result.qps[tostring(i)] = (dict:get(qps_second_key_prefix .. i) or 0);
    end
    return cjson.encode(result);
end
return qps_log;

