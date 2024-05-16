local helpers = require "helpers"
local pattern =
"/(hack|shell|spy|phpspy)\\.php$";

return helpers.reg_match(ngx.var.uri, pattern)
