local status_key_prefix = "0_";
local host_key_prefix = "1_";
local ip_key_prefix = "2_";
local intercepted_id_key_prefix = "3_";
local intercepted_name_key_prefix = "4_";
local intercepted_block_type_key_prefix = "5_";
local url_key_prefix = "6_";
local helpers = require "helpers";
local dict_counter = require "dict_counter";
local cjson = require "cjson";
local timeout = 60 * 60 * 24;
local counter_log = {}

local dict = ngx.shared.counter_log_data;
local function status_counter()
    dict_counter.incr_counter(dict, status_key_prefix .. ngx.status, timeout)
end
local function host_counter()
    dict_counter.incr_counter(dict, host_key_prefix .. ngx.var.host, timeout)
end
local function ip_counter()
    dict_counter.incr_counter(dict, ip_key_prefix .. helpers.get_client_ip(),
                              timeout)
end

local function intercepted_id_counter()
    if ngx.ctx.waf_intercepted_id ~= nil then
        dict_counter.incr_counter(dict, intercepted_id_key_prefix ..
                                      ngx.ctx.waf_intercepted_id, timeout)
    end
end

local function intercepted_name_counter()
    if ngx.ctx.waf_intercepted_id ~= nil then
        dict_counter.incr_counter(dict, intercepted_name_key_prefix ..
                                      ngx.ctx.waf_intercepted_name, timeout)
    end
end

local function intercepted_block_type_counter()
    if ngx.ctx.waf_intercepted_block_type ~= nil then
        dict_counter.incr_counter(dict, intercepted_block_type_key_prefix ..
                                      ngx.ctx.waf_intercepted_block_type,
                                  timeout)
    end
end

local function url_counter()
    dict_counter.incr_counter(dict, url_key_prefix ..ngx.var.scheme .."://"..  ngx.var.host ..
                                  ngx.var.request_uri, timeout)
end
function counter_log.log_request()
    status_counter();
    host_counter();
    ip_counter();
    intercepted_id_counter();
    intercepted_name_counter();
    intercepted_block_type_counter();
    url_counter();
end

function counter_log.log2json()
    local keys = dict:get_keys()
    local result = {
        statusDict = {},
        hostDict = {},
        ipDict = {},
        interceptedIdDict = {},
        interceptedNameDict = {},
        interceptedBlockTypeDict = {}
    };
    for i, key in ipairs(keys) do
        local prefix = key:sub(1, 2);
        local keyName = key:sub(3);
        local keyValue = dict:get(key);
        if prefix == status_key_prefix then
            result.statusDict[keyName] = keyValue;
        elseif prefix == host_key_prefix then
            result.hostDict[keyName] = keyValue;
        elseif prefix == ip_key_prefix then
            result.ipDict[keyName] = keyValue;
        elseif prefix == intercepted_id_key_prefix then
            result.interceptedIdDict[keyName] = keyValue;
        elseif prefix == intercepted_name_key_prefix then
            result.interceptedNameDict[keyName] = keyValue;
        elseif prefix == intercepted_block_type_key_prefix then
            result.interceptedBlockTypeDict[keyName] = keyValue;
        end
    end
    return cjson.encode(result);
end

return counter_log;
