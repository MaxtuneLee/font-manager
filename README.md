# Node 字体管理器
技术栈为 Next、Prisma、Tailwind CSS

# 如何以开发环境运行？
1. 安装依赖
```bash
pnpm install
```
2. 准备数据库
```bash
docker run --name mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME="default" -e MONGO_INITDB_ROOT_PASSWORD="default" -d prismagraphql/mongo-single-replica:5.0.3
```
3. 初始化 Prisma
```bash
pnpm dlx prisma generate
pnpm dlx prisma db push
```
4. 运行
```bash
pnpm dev
```

> 提醒：项目还没有，Production ready

# todo
- [ ] 更多的字体信息
- [ ] 删除字体
- [ ] api 文档
- [ ] api key