local counter_log = require "counter_log";
local qps_log = require "qps_log";

local helpers = require "helpers"
ngx.header.content_type = "application/json; charset=utf-8"
ngx.say(      ngx.var.request_path)