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
function qps_log.log2json(start_time, end_time, date_format)

    local time_span = end_time - start_time;
    local key_prefix;
    local time2Add;

    if date_format == "%Y%m%d%H%M%S" then
        key_prefix = qps_key_prefix;
        time2Add = 1;
    elseif date_format == "%Y%m%d%H%M" then
        key_prefix = qpm_key_prefix;
        time2Add = 60;
    elseif date_format == "%Y%m%d%H" then
        key_prefix = qph_key_prefix;
        time2Add = 60 * 60;
    elseif date_format == "%Y%m%d" then
        key_prefix = qpd_key_prefix;
        time2Add = 60 * 60 * 24;
    end

    local result = {};

    local i = start_time
    while i < end_time do
        local formatted_date_time = os.date(date_format, i)
        result[formatted_date_time] = (dict:get(key_prefix ..
                                                    formatted_date_time) or 0);
        i = i + time2Add
    end

    return cjson.encode(result);
end
return qps_log;

