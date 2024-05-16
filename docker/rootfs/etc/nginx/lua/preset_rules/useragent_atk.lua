local helpers = require "helpers"
local pattern =
"(?:define|eval|file_get_contents|include|require_once|shell_exec|phpinfo|system|passthru|chr|char|preg_\\w+|execute|echo|print|print_r|var_dump|(fp)open|alert|showmodaldialog|file_put_contents|fopen|urldecode|scandir)\\(";
return helpers.reg_match(ngx.var.http_user_agent, pattern)
