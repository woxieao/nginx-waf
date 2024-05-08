local counter_log = require "counter_log";
local qps_log = require "qps_log";

local helpers = require "helpers"

ngx.say(qps_log.log2json(helpers.get_current_time(),
                         helpers.get_current_time() + 60, "%Y%m%d%H%M%S"))
