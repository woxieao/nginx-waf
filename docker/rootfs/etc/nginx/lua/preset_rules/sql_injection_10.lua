local helpers = require "helpers"
local pattern =
"\\s*(or|xor|and)\\s+.*(=|<|>|'|\")";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
