local qps_key_prefix = "0_";
local qpm_key_prefix = "1_";
local qph_key_prefix = "2_";
local qpd_key_prefix = "3_";

local dict_counter = require "dict_counter";
local helpers = require "helpers";
local cjson = require "cjson";
local qps_log = {}
local dict = ngx.shared.qps_log_data;

function qps_log.log_request()

    local secondTimestamp = helpers.get_current_time_str();
    local minuteTimestamp = string.sub(secondTimestamp, 1, -3);
    local hourTimestamp = string.sub(secondTimestamp, 1, -5);
    local dayTimestamp = string.sub(secondTimestamp, 1, -7);

    dict_counter.incr_counter(dict, qps_key_prefix .. secondTimestamp)
    dict_counter.incr_counter(dict, qpm_key_prefix .. minuteTimestamp)
    dict_counter.incr_counter(dict, qph_key_prefix .. hourTimestamp)
    dict_counter.incr_counter(dict, qpd_key_prefix .. dayTimestamp)
end
function qps_log.log2json(start_time, end_time)
    ngx.say(start_time, end_time)
    local str_len = tostring(start_time);
    start_time = tonumber(start_time)
    end_time = tonumber(end_time)

    local key_prefix = "";
    if str_len == 14 then
        key_prefix = qps_key_prefix;
    elseif str_len == 12 then
        key_prefix = qpm_key_prefix;
    elseif str_len == 10 then
        key_prefix = qph_key_prefix;
    elseif str_len == 8 then
        key_prefix = qpd_key_prefix;
    end

    local result = {};
    for i = start_time, end_time do
        result[tostring(i)] = (dict:get(key_prefix .. i) or 0);
    end
    return cjson.encode(result);
end
return qps_log;

