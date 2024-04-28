-- /etc/nginx/bin/resty -e '
if ngx.shared.shared_data ~= nil then    print(ngx.shared.shared_data:get("waf_detectors_list")) end
-- '
