local rgx = waf.rgxMatch
local htmlEntityDecode = waf.htmlEntityDecode
local concat = table.concat

local function hMatch(v)
    local m = rgx(htmlEntityDecode(v), "[\\n\\r]", "jo")
    if m then
        return m, v
    end
    return false
end

local function vMatch(v)
    local m = rgx(htmlEntityDecode(v), "[\\n\\r]+(?:\\s|location|refresh|(?:set-)?cookie|(?:x-)?(?:forwarded-(?:for|host|server)|host|via|remote-ip|remote-addr|originating-IP))\\s*:", "josi")
    if m then
        return m, v
    end
    return false
end

local m, d = waf.kvFilter(waf.reqHeaders, hMatch)
if m then
    return m, d, true
end

local queryString = waf.queryString
if queryString then
    for k, v in pairs(waf.queryString) do
        m, d = hMatch(k)
        if m then
            return m, d, true
        end
        if type(v)=="table" then
            v = concat(v,",")
        end
        m, d = vMatch(v)
        if m then
            return m, d, true
        end
    end
end

local form = waf.form
if form then
    for k, _ in pairs(form["FORM"]) do
        m, d = hMatch(k)
        if m then
            return m, d, true
        end
    end
end

return false