# 诡序档案馆 · 群世界观网站

一个可以直接部署到 **GitHub Pages** 的静态网站，包含三个板块：

| 板块 | 说明 |
|---|---|
| **世界观** | 首页。世界背景、核心设定、阵营组织、大事记时间线、玩家守则 |
| **人设档案** | 展示 QQ 群玩家们的角色档案，支持按阵营 / 状态筛选、关键词搜索，点击卡片查看完整设定 |
| **留言板** | 玩家互相留言（基于 Giscus，免费、无需自建服务器） |

## 目录结构

```
worldview-site/
├── index.html          # 网站入口（含顶部配置区）
├── css/style.css       # 样式
├── js/data.js          # 世界观文案 + 人设档案数据（改这里）
├── js/app.js           # 路由、渲染、筛选、留言板逻辑
└── assets/hero.jpg     # 首页主视觉图
```

## 一、把网站部署到 GitHub Pages

### 方法 A：网页上传（最简单，适合不常用命令行）

1. 注册一个 GitHub 账号：[github.com](https://github.com/signup)
2. 登录后点击右上角 **+** → **New repository**
   - Repository name 填：`worldview-site`（或任意名字）
   - 选择 **Public**（公开）
   - 不要勾选 "Add a README" 等初始化选项
   - 点击 **Create repository**
3. 在新页面中点 **uploading an existing file**，把 `index.html`、`css` 文件夹、`js` 文件夹、`assets` 文件夹一次性拖进去，点 **Commit changes**
4. 进入仓库 **Settings** → 左侧 **Pages**
   - Source 选择 **Deploy from a branch**
   - Branch 选 `main`，目录选 `/ (root)`
   - 点 **Save**
5. 等一两分钟，你的网站地址就是：
   `https://你的GitHub用户名.github.io/worldview-site/`
   （页面顶部会显示这个地址）

### 方法 B：Git 命令行推送（更正规）

```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/你的用户名/worldview-site.git
git push -u origin main
```

然后按方法 A 的第 4 步开启 Pages 即可。

## 二、开启留言板（Giscus）

留言板使用 [Giscus](https://giscus.app) —— 它把留言存到 GitHub 仓库的 Discussions 讨论区，免费、稳定，不需要自己买服务器。

1. **开启仓库的 Discussions**：仓库 Settings → 拉到 **Features** → 勾选 **Discussions** → Save
2. **安装 Giscus 应用**：打开 [giscus.app](https://giscus.app)，点击页面上的 **Enable giscus** 登录并安装（选择你刚才建的仓库，也可以安装到个人账号下全部仓库）
3. **获取配置**：在 giscus.app 页面往下填：
   - Repository 填：`用户名/worldview-site`
   - 页面会自动算出 repo id / category id
4. **填入网站**：打开 `index.html`，找到文件顶部的配置区（注释写着「站点配置区 —— 改这里」），把 giscus 下的这几项填上：

```js
giscus: {
  enabled: true,               // ← 改成 true
  repo: "你的用户名/worldview-site",   // ← 你的仓库
  repoId: "R_kgDO...",         // ← giscus.app 给的值
  category: "Announcements",   // ← 分类名（建议建一个叫 Announcements 的分类）
  categoryId: "DIC_kwDO...",   // ← giscus.app 给的值
  mapping: "pathname",
  lang: "zh-CN"
}
```

5. 把改好的文件重新上传 / 推送，留言板即可使用。
   - 玩家留言需要 GitHub 账号（首次留言会提示登录授权），这是 Giscus 的机制。

> 如果暂时不想开留言板，把 `enabled` 保持 `false`，页面会显示"留言板尚未开启"的引导卡片，不影响其他功能。

## 三、修改内容

### 改世界观文案 / 阵营 / 时间线 / 守则

打开 `js/data.js`，文件顶部注释已标明每个板块的位置：
- `WORLD_CORE`：首页「核心设定」六张卡片
- `WORLD_CAMPS`：首页「阵营与组织」卡片
- `WORLD_TIMELINE`：首页「大事记」时间线
- `PLAYER_RULES`：首页「玩家守则」
- `CHARACTERS`：人设档案（见下）

改完保存、重新上传推送即可生效。

### 新增一个角色档案

打开 `js/data.js`，找到 `CHARACTERS` 数组（文件后半部分），照最后一个角色的格式复制一份，填上内容：

```js
{
  name: "角色名",
  title: "称号 / 身份",
  camp: "阵营（如：守灯局）",
  status: "alive",   // 可选：alive 存活 / missing 失踪 / fallen 陨落 / anomaly 异常化
  level: "B",        // 危险等级：D / C / B / A / S
  qq: "玩家 QQ 昵称",
  avatar: "",        // 头像图片：留空显示名字首字印章头像；自定义请放 assets/ 后填相对路径如 "assets/avatar-1.jpg"
  ability: "能力 / 异常特征一句话",
  quote: "角色签名（可选）",
  story: "背景故事",
  details: ["补充要点 1", "补充要点 2"]
}
```

注意：两个角色对象之间要用英文逗号 `,` 隔开（看示例的写法即可）。

### 换首页主视觉图

把新图片命名为 `hero.jpg` 放到 `assets/` 文件夹替换原文件即可（建议宽高比 16:9，如 1600×900）。

## 四、本地预览

直接双击 `index.html` 即可在浏览器打开预览（留言板在未配置时会显示引导卡片，其他功能完整可用）。

## 说明

- 网站为纯前端静态站，无数据库；人设数据全部在 `js/data.js` 中维护。
- 留言数据由 Giscus 托管在 GitHub Discussions，跟随仓库长期保存。
- 页面暗黑怪谈风可自行在 `css/style.css` 顶部的 `:root` 变量中调整配色。
