local function mainFunc()
    local function ruleLogic()
        ngx.header["Hello"] = "World!"
        return false;

    end
    local match = ruleLogic();
    ngx.shared.exec_counter:incr('r_3', 1)
    if match == true then
        ngx.shared.block_counter:incr('r_3', 1);
        ngx.header["Intercepted"] = 3;
        ngx.exit(ngx.HTTP_FORBIDDEN)
    end
end
return mainFunc
