local dict_counter = {}
function dict_counter.incr_counter(dict, key, timeout)
    timeout = timeout or 60 * 60 * 24 * 30;
    if dict ~= nil then
        local count = dict:get(key);
        if count == nil then dict:add(key, 0, timeout) end
        return dict:incr(key, 1)
    end
end

return dict_counter;
