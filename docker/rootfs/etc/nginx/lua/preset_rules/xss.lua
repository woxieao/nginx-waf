local pattern = { "jscript",
    "onsubmit",
    "copyparentfolder",
    "javascript",
    "onchange",
    "onmove",
    "onkeydown",
    "onkeyup",
    "activexobject",
    "onerror",
    "onmouseup",
    "ecmascript",
    "bexpression",
    "onmouseover",
    "vbscript:",
    "<![cdata[",
    ".innerhtml",
    "settimeout",
    "shell:",
    "onabort",
    "asfunction:",
    "onkeypress",
    "onmousedown",
    "onclick",
    ".fromcharcode",
    "background-image:",
    "x-javascript",
    "ondragdrop",
    "onblur",
    "mocha:",
    "javascript:",
    "onfocus",
    "lowsrc",
    "getparentfolder",
    "onresize",
    "@import",
    "alert",
    "script",
    "onselect",
    "onmouseout",
    "application",
    "onmousemove",
    "background",
    ".execscript",
    "livescript:",
    "vbscript",
    "getspecialfolder",
    ".addimport",
    "iframe",
    "onunload",
    "createtextrange",
    "<input",
    "onload" };
local helpers = require "helpers";
local args = ngx.req.get_uri_args();
ngx.req.read_body()
local body_data = ngx.req.get_body_data()
if helpers.arr_contains(args, pattern) then
    return true;
end

if helpers.arr_contains({ body_data = body_data }, pattern) then
    return true;
end
return false
