
local function test_1_main_body()

    ngx.header["test_1_main_body-header"] = "hey!"
end

return test_1_main_body