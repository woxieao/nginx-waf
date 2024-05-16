local helpers = require "helpers"
local pattern =
"(bin\\(|ascii\\(|benchmark\\(|concat_ws\\(|group_concat\\(|strcmp\\(|left\\(|datadir\\(|greatest\\()";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
