local pattern =
"(onafterprint|onbeforeprint|onbeforeunload|onblur|oncanplay|oncanplaythrough|onchange|onclick|oncontextmenu|ondblclick|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|ondurationchange|onemptied|onended|onerror|onfocus|onformchange|onforminput|onhaschange|oninput|oninvalid|onkeydown|onkeypress|onkeyup|onload|onloadeddata|onloadedmetadata|onloadstart|onmessage|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onmousewheel|onoffline|ononline|onpagehide|onpageshow|onpause|onplay|onplaying|onpopstate|onprogress|onratechange|onreadystatechange|onredo|onreset|onresize|onscroll|onseeked|onseeking|onselect|onstalled|onstorage|onsubmit|onsuspend|ontimeupdate|onundo|onunload|onvolumechange|onwaiting)\\s*=";
local args = ngx.req.get_uri_args();
ngx.req.read_body()
local body_data = ngx.req.get_body_data()


for id, request_arg in pairs(args) do
    local captures, _ = ngx.re.match(request_arg, pattern, "jo")
    if captures then
        return true;
    end
end
local body_captures, _ = ngx.re.match(body_data, pattern, "jo")
if body_captures then
    return true;
end

return false
