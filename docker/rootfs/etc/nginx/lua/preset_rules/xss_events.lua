local helpers = require "helpers"
local pattern =
"(onafterprint|onbeforeprint|onbeforeunload|onblur|oncanplay|oncanplaythrough|onchange|onclick|oncontextmenu|ondblclick|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|ondurationchange|onemptied|onended|onerror|onfocus|onformchange|onforminput|onhaschange|oninput|oninvalid|onkeydown|onkeypress|onkeyup|onload|onloadeddata|onloadedmetadata|onloadstart|onmessage|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onmousewheel|onoffline|ononline|onpagehide|onpageshow|onpause|onplay|onplaying|onpopstate|onprogress|onratechange|onreadystatechange|onredo|onreset|onresize|onscroll|onseeked|onseeking|onselect|onstalled|onstorage|onsubmit|onsuspend|ontimeupdate|onundo|onunload|onvolumechange|onwaiting)\\s*=";

return helpers.reg_match_list(helpers.get_all_request_input_string(), pattern)
