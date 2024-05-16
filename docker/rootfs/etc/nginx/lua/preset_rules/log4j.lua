local helpers = require "helpers"
local pattern =
"\\${jndi:";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
