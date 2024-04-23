
local function test_1_main_body()

    ngx.header["test_2_main_body-header"] = "you!"
end

return test_1_main_body