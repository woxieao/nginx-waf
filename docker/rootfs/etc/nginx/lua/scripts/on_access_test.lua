local test_arg = ngx.var.arg_test_arg
if test_arg == "get" then
    ngx.header["test-header"] = "get" 
else
    ngx.header["test-header"] = "not get" .. test_arg
end
