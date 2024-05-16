ngx.say("你的请求已被拦截")
ngx.exit(ngx.ctx.status_code or ngx.HTTP_FORBIDDEN)