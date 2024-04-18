local test_arg = ngx.var.arg_test_arg
ngx.header["test_arg"] = "test_arg " .. tostring(test_arg)
