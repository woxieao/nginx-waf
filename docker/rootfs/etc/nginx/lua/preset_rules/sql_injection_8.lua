local helpers = require "helpers"
local pattern =
"(@@version|load_file\\(|NAME_CONST\\(|exp\\(\\~|floor\\(rand\\(|geometrycollection\\(|multipoint\\(|polygon\\(|multipolygon\\(|linestring\\(|multilinestring\\()";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
