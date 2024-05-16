local helpers = require "helpers"
local pattern =
"\\.(bak|inc|old|mdb|sql|php~|swp|java|class|dll|exe|cs|)$";

return helpers.reg_match(ngx.var.uri, pattern)
