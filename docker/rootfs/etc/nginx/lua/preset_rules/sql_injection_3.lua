local helpers = require "helpers"
local pattern =
"(?:from\\W+information_schema\\W)";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
