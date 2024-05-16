local helpers = require "helpers"
local pattern =
"(?:(?:current_)user|database|concat|extractvalue|polygon|updatexml|geometrycollection|schema|multipoint|multipolygon|connection_id|linestring|multilinestring|exp|right|sleep|group_concat|load_file|benchmark|file_put_contents|urldecode|system|file_get_contents|select|substring|substr|fopen|popen|phpinfo|user|alert|scandir|shell_exec|eval|execute|concat_ws|strcmp|right)\\s*\\(";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
