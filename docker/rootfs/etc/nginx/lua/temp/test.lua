-- 导入 JSON 库
local cjson = require("cjson")

-- 示例 JSON 数组
local json_str = '[{"name":"test","value":1},{"name":"test2","value":3},{"name":"test3","value":2}]'

-- 解析 JSON 数组为 Lua 的数据结构
local array = cjson.decode(json_str)

-- 对数组进行排序（按照 value 字段降序排序）
table.sort(array, function(a, b) return a.value > b.value end)

-- 获取排序后的前 100 位元素
local max100 = {}
for i = 1, math.min(100, #array) do
    max100[i] = array[i]
end

-- 输出结果
for i, v in ipairs(max100) do
    print(i, v.name, v.value)
end