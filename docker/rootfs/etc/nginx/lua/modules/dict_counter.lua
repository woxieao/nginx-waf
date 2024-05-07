local dict_counter = {}
function dict_counter.incr_counter(dict, key)
    if dict ~= nil then
        local count = dict:get(key);
        if count == nil then dict:set(key, 0) end
        dict:incr(key, 1)
    end
end
return dict_counter;
