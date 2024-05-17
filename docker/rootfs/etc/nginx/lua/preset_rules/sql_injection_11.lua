local helpers = require "helpers"
local pattern =
"/\\*.+?\\*/|(?:#|--).*?\\n|(\"|')(?:\\\\\\1|[^\\1])*?\\1|`.*?`";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
