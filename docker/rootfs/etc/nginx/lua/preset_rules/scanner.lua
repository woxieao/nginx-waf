local helpers = require "helpers"
local pattern =
"(WPScan|HTTrack|antSword|harvest|audit|dirbuster|pangolin|nmap|sqln|hydra|Parser|libwww|BBBike|sqlmap|w3af|owasp|Nikto|fimap|havij|zmeu|BabyKrokodil|netsparker|httperf| SF/)";
return helpers.reg_match(ngx.var.http_user_agent, pattern)
