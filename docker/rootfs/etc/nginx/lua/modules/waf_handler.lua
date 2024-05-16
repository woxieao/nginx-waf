local dict_counter = require "dict_counter";
local helpers = require "helpers";

local _M = {};
function _M.detection_request(matched, rule_id, rule_name, block_type)
    local html = [[
    <!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>访问被拒绝</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
            padding: 20px;
            text-align: center;
        }
        .container h1 {
            font-size: 24px;
            color: #e74c3c;
        }
        .container p {
            font-size: 16px;
            line-height: 1.5;
        }
        .ip-address {
            font-weight: bold;
            color: #c0392b;
        }
        .warning {
            background-color: #ffe6e6;
            border: 1px solid #e74c3c;
            border-radius: 4px;
            padding: 10px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>访问被拒绝</h1>
        <p>由于可疑活动，您的请求已被阻止。</p>
        <p>拦截类型：<span class="reason">]] .. rule_name .. [[</span></p>
        <p>您的IP地址：<span class="ip-address">]] ..  helpers.get_client_ip() .. [[</span></p>
        <div class="warning">
            <p><strong>警告：</strong>您的请求已被记录。如果可疑行为继续，您的请求可能会被永久封禁。</p>
        </div>
        <p class="footer">如果您认为这是误报，请联系网站管理员修改防火墙拦截规则。</p>
    </div>
</body>
</html>
]];

    dict_counter.incr_counter(ngx.shared.exec_counter, 'r_' .. rule_id, 0)
    if matched == true then
        dict_counter.incr_counter(ngx.shared.block_counter, 'r_' .. rule_id, 0)
        ngx.ctx.waf_intercepted_id = rule_id;
        ngx.ctx.waf_intercepted_name = rule_name;
        ngx.ctx.waf_intercepted_block_type = block_type;
        if _M.is_show_detail() then
            ngx.status = ngx.ctx.status_code or ngx.HTTP_FORBIDDEN;
            ngx.say(html);
        end
        ngx.exit(ngx.ctx.status_code or ngx.HTTP_FORBIDDEN)
    end
end

--每分钟请求次数超过一定阈值则直接返回错误码,而不返回详情,节约流量
function _M.is_show_detail()
    local ip_recorder = require "ip_recorder"
    if ip_recorder.get_ip_request_count("m") < 1000 and ip_recorder.get_ip_request_count("h") < 10000 then
        return true;
    end
    return false;
end

return _M;
