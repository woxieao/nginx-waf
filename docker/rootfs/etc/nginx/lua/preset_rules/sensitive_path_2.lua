local helpers = require "helpers"
local pattern =
"^/(vhost|bbs|host|wwwroot|www|site|root|backup|data|ftp|db|admin|website|web).*\\.(rar|sql|zip|tar\\.gz|tar)$";

return helpers.reg_match(ngx.var.uri, pattern)
