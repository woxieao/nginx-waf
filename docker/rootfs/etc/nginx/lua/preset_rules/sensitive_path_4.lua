local helpers = require "helpers"
local pattern =
"^/(attachments|css|uploadfiles|static|forumdata|cache|avatar)/(\\w+).(php|jsp)$";

return helpers.reg_match(ngx.var.uri, pattern)
