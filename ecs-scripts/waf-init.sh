#!/bin/bash

# 定义基础目录
BASE_DIRECTORY="/clouddream/nginx-waf"

# 检查目录是否存在
if [ ! -d "$BASE_DIRECTORY" ]; then
  # 目录不存在，创建目录
  mkdir -p "$BASE_DIRECTORY"
  echo "Directory created: $BASE_DIRECTORY"
else
  # 目录已存在
  echo "Directory already exists: $BASE_DIRECTORY"
fi

# 创建 docker-compose.yml 文件并写入内容
DOCKER_COMPOSE_FILE="$BASE_DIRECTORY/docker-compose.yml"
cat <<EOF > "$DOCKER_COMPOSE_FILE"
version: '3.8'
services:
  app:
    container_name: wezhan-waf-app
    image: 'wezhan-waf'
    restart: unless-stopped
    ports:
      - '80:80'
      - '5003:81'
      - '443:443'
    volumes:
      - /clouddream/nginx-proxy-manage/data:/data
      - /clouddream/nginx-proxy-manage/letsencrypt:/etc/letsencrypt
EOF

echo "docker-compose.yml file created at $DOCKER_COMPOSE_FILE"

docker compose -f /clouddream/nginx-proxy-manage/docker-compose.yml down

docker compose -f /clouddream/wezhan-waf/docker-compose.yml up -d

