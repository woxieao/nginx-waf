local counter_log = require "counter_log";
local qps_log = require "qps_log";

local helpers = require "helpers"

ngx.say(qps_log.log2json(os.time() - 60, os.time()))
