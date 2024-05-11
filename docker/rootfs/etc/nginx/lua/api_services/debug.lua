local counter_log = require "counter_log";
local qps_log = require "qps_log";

local helpers = require "helpers"
ngx.header.content_type = "application/json; charset=utf-8"
ngx.say("222")
ngx.say(ngx.var.http_user_agent)
