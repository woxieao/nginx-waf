--流氓爬虫
local helpers = require "helpers"
local pattern =
"(badbot|evilbot|malicious|scrapy|python-requests|java|mechanize|mj12bot|dotbot|semrushbot|screaming|ahrefsbot|libwww-perl|curl|wget|httpclient|netcraft|masscan|zgrab|nmap|nessus|nikto|acunetix|sqlmap)";
return helpers.reg_match(ngx.var.http_user_agent, pattern)
