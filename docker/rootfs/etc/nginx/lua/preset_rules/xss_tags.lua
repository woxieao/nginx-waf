local helpers = require "helpers"
local pattern =
"<[\\s]*(iframe|script|body|img|layer|div|meta|style|base|object|input)";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
