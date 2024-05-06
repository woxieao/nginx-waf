local rgx = waf.rgxMatch

local function fileNameMatch(v)
    local m = rgx(v, "\\.(?:as|cer\\b|cdx|ph|jsp|war|class|exe|ht|env|user\\.ini)|php\\.ini", "joi")
    if m then
        return m, v
    end
    return false
end
if waf.form then
    local m, d = waf.knFilter(waf.form["FILES"], fileNameMatch, 1)
    return m, d, true
end

return false