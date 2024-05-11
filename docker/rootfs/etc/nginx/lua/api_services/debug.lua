local counter_log = require "counter_log";
local qps_log = require "qps_log";

local helpers = require "helpers"
ngx.header.content_type = "application/json; charset=utf-8"
ngx.say("333")

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
ngx.say(get_os_from_ua(ngx.var.http_user_agent))
