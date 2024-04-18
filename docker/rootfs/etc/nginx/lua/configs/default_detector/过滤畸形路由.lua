if waf.rgxMatch(waf.reqUri,"%u00(?:aa|ba|d0|de|e2|f0|fe)","i") then
    return true,waf.reqUri,true
   end
   return false