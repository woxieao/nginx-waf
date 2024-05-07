local counter_log = require "counter_log";

local get_ip = require "get_ip"

ngx.say(get_ip())
--ngx.say(counter_log.log2json())
