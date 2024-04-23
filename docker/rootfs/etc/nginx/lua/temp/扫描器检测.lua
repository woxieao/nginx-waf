local m, d = waf.plugins.scannerDetection.check()
if m then
    return true, d, true
end
return false