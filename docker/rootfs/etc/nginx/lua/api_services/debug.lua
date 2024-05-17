local my_dict = ngx.shared.counter_log_data;

-- 插入1000条数据
for i = 1, 10000 do
    local key = "key" .. i
    local value = "value" .. i
    my_dict:set(key, value)
end

local keys = my_dict:get_keys(5000,"key1")
for i, key in ipairs(keys) do
    ngx.say(key);
end
