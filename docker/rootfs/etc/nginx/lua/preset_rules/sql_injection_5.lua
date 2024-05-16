local helpers = require "helpers"
local pattern =
"into\\s+(?:dump|out)file\\s*";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
