local counter_log = require "counter_log";
local qps_log = require "qps_log";

local get_ip = require "get_ip"

-- ngx.say(get_ip())
ngx.say(qps_log.log2json(os.time() - 60, os.time()))
