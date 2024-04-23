local ib = waf.ipBlock
local c = ib:get(waf.ip)
if c and c >= 100 then
    ib:set(waf.ip, c, 600, 1)
    return true, "ip blocked for continue attack: " .. waf.ip, true
end
return false