local status_key_prefix = "0_";
local host_key_prefix = "1_";
local intercepted_id_key_prefix = "2_";
local intercepted_name_key_prefix = "3_";
local intercepted_block_type_key_prefix = "4_";
local ua_os_key_prefix = "5_";
local ua_browser_key_prefix = "6_";
local helpers = require "helpers";
local dict_counter = require "dict_counter";
local cjson = require "cjson";
local timeout = 60 * 60 * 24;
local counter_log = {}

local general_dict = ngx.shared.analysis_log_general;
local ip_dict = ngx.shared.analysis_log_ip;
local url_dict = ngx.shared.analysis_log_url;

local function status_counter()
    dict_counter.incr_counter(general_dict, status_key_prefix .. ngx.status, timeout)
end
local function host_counter()
    dict_counter.incr_counter(general_dict, host_key_prefix .. ngx.var.host, timeout)
end
local function intercepted_id_counter()
    if ngx.ctx.waf_intercepted_id ~= nil then
        dict_counter.incr_counter(general_dict, intercepted_id_key_prefix ..
            ngx.ctx.waf_intercepted_id, timeout)
    end
end

local function intercepted_name_counter()
    if ngx.ctx.waf_intercepted_id ~= nil then
        dict_counter.incr_counter(general_dict, intercepted_name_key_prefix ..
            ngx.ctx.waf_intercepted_name, timeout)
    end
end

local function intercepted_block_type_counter()
    if ngx.ctx.waf_intercepted_block_type ~= nil then
        dict_counter.incr_counter(general_dict, intercepted_block_type_key_prefix ..
            ngx.ctx.waf_intercepted_block_type,
            timeout)
    end
end

local function ip_counter()
    dict_counter.incr_counter(ip_dict, helpers.get_client_ip(),
        timeout)
end

local function url_counter()
    dict_counter.incr_counter(url_dict,
        ngx.var.scheme .. "://" ..
        ngx.var.host .. ngx.var.uri, timeout)
end

local function get_os_from_ua(userAgent)
    if userAgent ~= nil then
        if string.find(userAgent, "Win") then return "Windows"; end
        if string.find(userAgent, "Mac") then return "macOS"; end
        if string.find(userAgent, "Linux") then return "Linux"; end
        if string.find(userAgent, "Android") then return "Android"; end
        if string.find(userAgent, "like Mac") then return "iOS"; end
    end
    return "Others";
end
local function get_browser_from_ua(userAgent)
    if userAgent ~= nil then
        if string.find(userAgent, "OPR") then return "Opera"; end
        if string.find(userAgent, "Edg") then return "Microsoft Edge"; end
        if string.find(userAgent, "MSIE") then
            return "IE";
        end
        if string.find(userAgent, "Chrome") then return "Chrome"; end
        if string.find(userAgent, "Safari") then return "Safari"; end
        if string.find(userAgent, "Firefox") then return "Firefox"; end
    end
    return "Others";
end

local function ua_os_counter()
    dict_counter.incr_counter(general_dict, ua_os_key_prefix ..
        get_os_from_ua(ngx.var.http_user_agent),
        timeout)
end

local function ua_browser_counter()
    dict_counter.incr_counter(general_dict, ua_browser_key_prefix ..
        get_browser_from_ua(ngx.var.http_user_agent),
        timeout)
end

function counter_log.log_request()
    status_counter();
    host_counter();
    ip_counter();
    intercepted_id_counter();
    intercepted_name_counter();
    intercepted_block_type_counter();
    url_counter();
    ua_os_counter();
    ua_browser_counter();
end

function counter_log.log2json()
    local general_keys = general_dict:get_keys()
    local result = {
        statusDict = {},
        hostDict = {},
        ipDict = {},
        interceptedIdDict = {},
        interceptedNameDict = {},
        interceptedBlockTypeDict = {},
        urlDict = {},
        uaOsDict = {},
        uaBrowserDict = {}
    };
    for _, key in ipairs(general_keys) do
        local prefix = key:sub(1, 2);
        local keyName = key:sub(3);
        local keyValue = general_dict:get(key);
        if prefix == status_key_prefix then
            result.statusDict[keyName] = keyValue;
        elseif prefix == host_key_prefix then
            result.hostDict[keyName] = keyValue;
        elseif prefix == intercepted_id_key_prefix then
            result.interceptedIdDict[keyName] = keyValue;
        elseif prefix == intercepted_name_key_prefix then
            result.interceptedNameDict[keyName] = keyValue;
        elseif prefix == intercepted_block_type_key_prefix then
            result.interceptedBlockTypeDict[keyName] = keyValue;
        elseif prefix == ua_os_key_prefix then
            result.uaOsDict[keyName] = keyValue;
        elseif prefix == ua_browser_key_prefix then
            result.uaBrowserDict[keyName] = keyValue;
        end
    end

    local ip_keys = ip_dict:get_keys(0);
    for _, key in ipairs(ip_keys) do
        result.ipDict[key] = ip_dict:get(key);
    end

    local url_keys = url_dict:get_keys(0);
    for _, key in ipairs(url_keys) do
        result.urlDict[key] = url_dict:get(key);
    end

    return cjson.encode(result);
end

return counter_log;
