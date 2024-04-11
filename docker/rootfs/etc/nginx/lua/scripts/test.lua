local args = ngx.req.get_uri_args()
ngx.say("Hello, ", args["name"] or "Lua!")
