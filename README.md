# React Monorepo

基于 npm workspaces、Vite、React 和 TypeScript 的 monorepo。

## 目录

```text
apps/
  web/       Web 项目
  admin/     Admin 项目
packages/
  ui/        两个项目共用的 React 组件
```

## 使用

```bash
npm install
npm run dev:web
npm run dev:admin
npm run build
```

每个 `apps/*` 文件夹都是一个独立项目，拥有自己的 `package.json`、入口和 Vite 配置。
