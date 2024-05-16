local helpers = require "helpers"
local pattern =
"(extractvalue\\(|concat\\(0x|user\\(\\)|substring\\(|count\\(\\*\\)|substring\\(hex\\(|updatexml\\()";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
