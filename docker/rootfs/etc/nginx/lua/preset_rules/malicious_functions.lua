local helpers = require "helpers"
local pattern =
"(define|eval|file_get_contents|include|require|require_once|shell_exec|phpinfo|system|passthru|char|chr|preg_\\w+|execute|echo|print|print_r|var_dump|(fp)open|alert|showmodaldialog)\\s*\\(";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
