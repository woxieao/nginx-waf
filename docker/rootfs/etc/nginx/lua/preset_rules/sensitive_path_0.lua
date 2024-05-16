local helpers = require "helpers"
local pattern =
"\\.(htaccess|mysql_history|bash_history|DS_Store|idea|user\\.ini)";

return helpers.reg_match(ngx.var.uri, pattern)
