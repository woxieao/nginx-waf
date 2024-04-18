if not waf.rgxMatch(waf.method, "^(?:GET|HEAD|POST|PUT|DELETE|OPTIONS)$") then
    return true, waf.method, true
end 