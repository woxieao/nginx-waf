local status_key_prefix = "0_";
local host_key_prefix = "1_";
local ip_key_prefix = "2_";
local intercepted_id_key_prefix = "3_";
local intercepted_name_key_prefix = "4_";
local intercepted_block_type_key_prefix = "5_";
local get_ip = require "get_ip";
local dict_counter = require "dict_counter";

local counter_log = {}

local dict = ngx.shared.counter_log_data;
local function status_counter()
    dict_counter.incr_counter(dict, status_key_prefix .. ngx.status)
end

local function host_counter()
    dict_counter.incr_counter(dict, host_key_prefix .. ngx.var.host)
end
local function ip_counter()
    dict_counter.incr_counter(dict, ip_key_prefix .. get_ip())
end

local function intercepted_id_counter()
    if ngx.var.waf_intercepted_id ~= nil then
        dict_counter.incr_counter(dict, intercepted_id_key_prefix ..
                                      ngx.ctx.waf_intercepted_id)
    end
end

local function intercepted_name_counter()
    if ngx.var.waf_intercepted_id ~= nil then
        dict_counter.incr_counter(dict, intercepted_name_key_prefix ..
                                      ngx.ctx.waf_intercepted_name)
    end
end

local function intercepted_block_type_counter()
    if ngx.var.waf_intercepted_block_type ~= nil then
        dict_counter.incr_counter(dict, intercepted_block_type_key_prefix ..
                                      ngx.ctx.waf_intercepted_block_type)
    end
end

function counter_log.log_request()
    status_counter();
    host_counter();
    ip_counter();
    intercepted_id_counter();
    intercepted_name_counter();
    intercepted_block_type_counter();
end

function counter_log.export_log()
    local keys = dict:get_keys()

    for i, key in ipairs(keys) do
        ngx.say("[", i, "]", key, ":", dict:get(key))
    end
end

return counter_log;
