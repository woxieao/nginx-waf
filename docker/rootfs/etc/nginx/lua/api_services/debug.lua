ngx.status = ngx.HTTP_FORBIDDEN
ngx.say("你的请求已被拦截!")
ngx.exit(403)