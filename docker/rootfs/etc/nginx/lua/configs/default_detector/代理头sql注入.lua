
local rip=waf.reqHeaders.x_forwarded_for
if rip then
	if type(rip) ~= "string" then
		return true,"Malform X-Forwarded-For",true
	elseif waf.contains(rip,"'") then
		return true,rip,true
	end
end
rip=waf.reqHeaders.client_ip
if rip then
	if type(rip) ~= "string" then
		return true,"Malform Client-IP",true
	elseif waf.contains(rip,"'") then
		return true,rip,true
	end
end
return false