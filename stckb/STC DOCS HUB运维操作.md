# STC DOCS HUB运维操作（Windows）

记录希姆计算在线对外文档中心的构建和运维相关操作。

## 操作须知

Windows系统中使用PowerShell完成环境准备、静态站点构建、网站部署等操作。软件栈包括：

- npm：侧重于安装或卸载某个模块，不具备执行能力。
- npx：重在执行命令，自动安装后也会自动删除。
- yarn：可以和npm互操作，是个功能强大的JS包管理器。
- nvm：是node版本管理工具，与fnm的用途相同，而非npm/yarn/pnpm这种依赖包管理工具。
- fnm：是一个快速、简单的 Node.js 版本管理器。

## 准备环境

安装所需软件栈：

1. 安装fnm并配置环境变量。

   ```powershell
   $ winget install Schniz.fnm
   ```

2. 创建并编辑profile文件，在profile文件中添加`fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression`并保存。
   ```powershell
   $ if (-not (Test-Path $profile)) { New-Item $profile -Force }
   $ Invoke-Item $profile
   ```

3. 安装Node.js并修改默认版本。

   ```powershell
   $ fnm install 22
   $ fnm use v22.14.0
   $ node -v
   v22.14.0
   $ npm -v
   10.9.2
   ```

4. 安装yarn。
   ```powershell
   $ npm install -g yarn
   $ yarn -v
   1.22.22
   ```

## 初始化Docusaurus项目

推荐通过命令行工具create-docusaurus安装Docusaurus，其中`--typescript`选项来使用模板的TypeScript变种。

```powershell
$ npx create-docusaurus@latest stc-docuhub classic --typescript
[INFO] Creating new Docusaurus project...
[INFO] Installing dependencies with npm...
[SUCCESS] Created stc-docuhub.
[INFO] Inside that directory, you can run several commands:

  `npm start`
    Starts the development server.

  `npm run build`
    Bundles your website into static files for production.

  `npm run serve`
    Serves the built website locally.

  `npm run deploy`
    Publishes the website to GitHub pages.

We recommend that you begin by typing:

  `cd stc-docuhub`
  `npm start`

Happy building awesome websites!
```

## 本地调试预览

在本地完成调试和预览工作，包括但不限于添加待发布的文档以及所需的图片、图标等静态资源文件，按需编辑`docusaurus.config.ts`、`\src\components\HomepageFeatures\index.tsx`、`\src\pages\index.tsx`、`sidebars.ts`等配置文件。

1. 进入项目文件夹，安装编译所需的依赖，以使用yarn为例。其中`yarn`命令等同于`yarn install`命令。

   ```powershell
   $ cd stc-docuhub
   $ yarn
   ```

2. 运行开发服务器。

   - 直接启动。添加编辑文档等，无需编译直接启动就可以预览效果。

     ```powershell
     $ yarn run start
     ```

   - 编译并启动。部分特性需要编译才可用，比如安装和使用第三方搜索插件。

     ```powershell
     $ yarn build
     $ yarn serve
     ```

3. 本地调试预览时，访问`http://localhost:3000/`或者`http://127.0.0.1:3000/`，而非机器的内网IP。

## 构建和部署静态站点

在GitHub中操作：

1. 创建部署到GitHub Pages所需的GitHub repo，具体操作请参见[创建Github Pages站点](https://docs.github.com/zh/pages/getting-started-with-github-pages/creating-a-github-pages-site)。

   > 说明：GitHub repo所有者为组织。

2. 在GitHub repo的**Settings**页面，修改**Code and automation** > **Pages**中的Build and deployment配置，将Source配置为Deploy from a branch，将Branch配置为待发布文档所在的分支，例如`main`，并指定静态站点文件的根目录`/(root)`，而非`docs`。

3. 生成GitHub私有凭证，具体操作请参见[Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)。

   > 说明：为个人账户生成凭证，并且为个人账户添加GitHub repo的Admin权限即可。

在本地操作：

1. 进入项目文件夹，生成静态站点的文件，以使用yarn为例。

   > 说明：使用部署命令，应该不用提前执行编译命令，部署命令会自动执行编译、部署、提交等一系列命令。

   ```powershell
   $ cd stc-docuhub
   $ yarn build
   ```

2. 将静态站点文件部署到GitHub Pages，或者按需选择其他渠道。

   ```powershell
   $ cmd /C 'set "GIT_USER=streamcomputinger" && set "DEPLOYMENT_BRANCH=main" && yarn deploy'
   ```

## 其他操作

### 更新Docusaurus版本

1. 在`package.json`中修改版本号，所有以`@docusaurus/`开头的包都需要使用同一版本。例如：

   ```powershell
   {
     "dependencies": {
       "@docusaurus/core": "3.7.0",
       "@docusaurus/preset-classic": "3.7.0",
       // ...
     }
   }
   ```

2. 执行命令完成更新以及依赖安装。

   ```powershell
   $ yarn install
   $ yarn add @docusaurus/core @docusaurus/preset-classic
   ```

### 启用搜索栏

#### Algolia DocSearch（官方推荐）

1. 注册Algolia账号。

2. 创建DocSearch Application。

   1. 添加网站Domain。
   2. 创建网站Crawler，并获取Application ID、Search API Key、Index Name。

3. 关联Docusaurus和DocSearch。

   1. 在`docusaurus.config.js`中添加字段，部署DocSearch。

      > 说明：目前还是搜索不到文档内容，可能是因为启用文档多实例导致未从`/docs`作为`routeBasePath`，后面如果需要使用Algolia DocSearch，可以考虑自定义以下`replaceSearchResultPathname`、`searchPagePath`等参数。

      ```js
      export default {
        // ...
        themeConfig: {
          // ...
          algolia: {
            // The application ID provided by Algolia
            appId: 'YOUR_APP_ID',
      
            // Public API key: it is safe to commit it
            apiKey: 'YOUR_SEARCH_API_KEY',
      
            indexName: 'YOUR_INDEX_NAME',
      
            // Optional: see doc section below
            contextualSearch: true,
      
            // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
            externalUrlRegex: 'external\\.com|domain\\.com',
      
            // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
            replaceSearchResultPathname: {
              from: '/docs/', // or as RegExp: /\/docs\//
              to: '/',
            },
      
            // Optional: Algolia search parameters
            searchParameters: {},
      
            // Optional: path for search page that enabled by default (`false` to disable it)
            searchPagePath: 'search',
      
            // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
            insights: false,
      
            // Optional: whether you want to use the new Ask AI feature (undefined by default)
            askAi: 'YOUR_ALGOLIA_ASK_AI_ASSISTANT_ID',
      
            //... other Algolia params
          },
        },
      };
      ```

   2. 自动触发一次Crawl。

4. 按需完成其他配置。

   1. 验证域名，否则只能体验七天。
   2. 编辑Index Configuration，然后手动触发一次Crawl。

#### 第三方离线搜索插件（简单易用）

1. 安装搜索插件，以docusaurus-search-local为例：

   ```powershell
   $ yarn add @easyops-cn/docusaurus-search-local
   $ yarn remove @easyops-cn/docusaurus-search-local
   ```

2. 启用搜索功能，按README在`docusaurus.config.js`中添加字段。

   > 说明：需要自定义`docsRouteBasePath`，适配下文档多实例的逻辑。
   
   ```powershell
   // In your `docusaurus.config.js`:
   module.exports = {
     // ... Your other configurations.
     themes: [
       // ... Your other themes.
       [
         require.resolve("@easyops-cn/docusaurus-search-local"),
         /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
         ({
           // ... Your options.
           // `hashed` is recommended as long-term-cache of index file is possible.
           hashed: true,
   
           // For Docs using Chinese, it is recomended to set:
           // language: ["en", "zh"],
   
           // Customize the keyboard shortcut to focus search bar (default is "mod+k"):
           // searchBarShortcutKeymap: "s", // Use 'S' key
           // searchBarShortcutKeymap: "ctrl+shift+f", // Use Ctrl+Shift+F
   
           // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
           // forceIgnoreNoIndex: true,
         }),
       ],
     ],
   };
   ```

docusaurus-search-local项目相关的信息如下：

### 下载PDF

1. 安装下载PDF插件，以docs-to-pdf为例。
   ```powershell
   $ npm install -g docs-to-pdf
   ```

2. 执行下载PDF的命令。

   > 说明：不同Docusaurus版本的网站使用的tag存在差异，下载时需要指定Docusaurus的版本。

   - 默认选择器下载。
   
     ```powershell
     $ npx docs-to-pdf docusaurus --initialDocURLs="https://your-docusaurus-v3-site.com/docs/" --version=3
     $ npx docs-to-pdf docusaurus --initialDocURLs="https://stream-computing.github.io/AI%E5%8A%A0%E9%80%9F%E5%8D%A1/%E5%B8%8C%E5%A7%86%E8%AE%A1%E7%AE%97%E6%9C%AF%E8%AF%AD%E8%A1%A8" --version=3
     ```
   
   - 自定义选择器下载。
   
     ```powershell
     $ npx docs-to-pdf --initialDocURLs="https://stream-computing.github.io/AI%E5%8A%A0%E9%80%9F%E5%8D%A1/%E5%B8%8C%E5%A7%86%E8%AE%A1%E7%AE%97%E6%9C%AF%E8%AF%AD%E8%A1%A8" --contentSelector="main" --paginationSelector="a.pagination-nav__link.pagination-nav__link--next" --excludeSelectors=".margin-vert--xl a,[class^='tocCollapsible'],.breadcrumbs,.theme-edit-this-page" --coverImage="https://your-docusaurus-v3-site.com/img/logo.png" --coverTitle="Your Docs"
     $ npx docs-to-pdf --initialDocURLs="https://stream-computing.github.io/AI%E5%8A%A0%E9%80%9F%E5%8D%A1/%E5%B8%8C%E5%A7%86%E8%AE%A1%E7%AE%97%E6%9C%AF%E8%AF%AD%E8%A1%A8" --contentSelector="main" --paginationSelector="a.pagination-nav__link.pagination-nav__link--next" --excludeSelectors=".margin-vert--xl a,[class^='tocCollapsible'],.breadcrumbs,.theme-edit-this-page" --outputPDFFilename="AI加速卡产品文档.pdf" --coverImage="https://stream-computing.github.io/img/stc_logo.png" --coverTitle="AI加速卡产品文档" --coverSub="STCP920/STCP950L/STCP950P" --tocTitle="目录"
     ```

docs-to-pdf项目相关的信息如下：

- 项目地址：https://github.com/jean-humann/docs-to-pdf

- 支持的CLI Global Options：

| Option                 | Required | Description                                                  |
| ---------------------- | -------- | ------------------------------------------------------------ |
| `--initialDocURLs`     | Yes      | set URL to start generating PDF from.                        |
| `--contentSelector`    | No       | used to find the part of main content                        |
| `--paginationSelector` | No       | CSS Selector used to find next page to be printed for looping. |
| `--excludeURLs`        | No       | URLs to be excluded in PDF                                   |
| `--excludeSelectors`   | No       | exclude selectors from PDF. Separate each selector **with comma and no space**. But you can use space in each selector. ex: `--excludeSelectors=".nav,.next > a"` |
| `--cssStyle`           | No       | CSS style to adjust PDF output ex: `--cssStyle="body{padding-top: 0;}"` *If you're project owner you can use `@media print { }` to edit CSS for PDF. |
| `--outputPDFFilename`  | No       | name of the output PDF file. Default is `docs-to-pdf.pdf`    |
| `--pdfMargin`          | No       | set margin around PDF file. Separate each margin **with comma and no space**. ex: `--pdfMargin="10,20,30,40"`. This sets margin `top: 10px, right: 20px, bottom: 30px, left: 40px` |
| `--paperFormat`        | No       | pdf format ex: `--paperFormat="A3"`. Please check this link for available formats [Puppeteer document](https://pptr.dev/api/puppeteer.paperformat) |
| `--coverTitle`         | No       | Title for the PDF cover.                                     |
| `--coverImage`         | No       | `<src>` Image for PDF cover (does not support SVG)           |
| `--coverSub`           | No       | Subtitle the for PDF cover. Add `<br/>` tags for multiple lines. |
| `--tocTitle`           | No       | Title for the table of contents.                             |
| `--disableCover`       | No       | Optional toggle to show the PDF cover or not                 |
| `--disableTOC`         | No       | Optional toggle to show the table of contents or not         |
| `--headerTemplate`     | No       | HTML template for the print header. Please check this link for details of injecting values [Puppeteer document](https://pptr.dev/#?product=Puppeteer&show=api-pagepdfoptions) |
| `--footerTemplate`     | No       | HTML template for the print footer. Please check this link for details of injecting values [Puppeteer document](https://pptr.dev/#?product=Puppeteer&show=api-pagepdfoptions) |
| `--puppeteerArgs`      | No       | Add puppeteer BrowserLaunchArgumentOptions arguments ex: --sandbox [Puppeteer document](https://pptr.dev/api/puppeteer.browserlaunchargumentoptions) |
| `--protocolTimeout`    | No       | Timeout setting for individual protocol calls in milliseconds. If omitted, the default value of 180000 ms (3 min) is used |
| `--filterKeyword`      | No       | Only adds pages to the PDF containing a given meta keywords. Makes it possible to generate PDFs of selected pages |
| `--baseUrl`            | No       | Base URL for all relative URLs. Allows to render the pdf on localhost (ci/Github Actions) while referencing the deployed page. |
| `--excludePaths`       | No       | URL Paths to be excluded                                     |
| `--restrictPaths`      | No       | Keep Only URL Path with the same rootPath as `--initialDocURLs` |
| `--extractIframes`     | No       | Extract and inline content from iframes (only same-origin or accessible iframes). Default is `false` |
| `--httpAuthUser`       | No       | HTTP Basic Auth username for protected documentation sites   |
| `--httpAuthPassword`   | No       | HTTP Basic Auth password for protected documentation sites   |

- 支持的Docusaurus Options：

| Option      | Required | Description                                                  |
| ----------- | -------- | ------------------------------------------------------------ |
| `--version` | No       | Docusaurus version. Default is 2. Supported versions: 1, 2, and 3. |
| `--docsDir` | No       | Path to Docusaurus build dir. Either absolute or relative from path of the shell. The local server will automatically find an available port if 3000 is occupied. |

### 显示文档关系图

1. 安装显示文档关系图的插件，以docusaurus-graph为例。

   ```powershell
   $ yarn add docusaurus-graph
   ```

2. 启用搜索功能，按README在`docusaurus.config.js`中添加字段。

   ```js
   module.exports = {
     // Other Docusaurus configurations...
     plugins: ['docusaurus-graph'],
   };
   ```

docusaurus-graph项目相关的信息如下：

> 说明：需要改造原文，用front matter手动添加相关文档链接，而非根据引用自动生成关系图。

- 项目地址：https://github.com/Arsero/docusaurus-graph

- 支持的目录路径配置：
  ```js
  module.exports = {
    // Other Docusaurus configurations...
    plugins: [
      [
        'docusaurus-graph',
        {
           docsDir: "docs",
           buildDir: "build",
           sourcesTag: "sources",
           referencesTag: "references",
        },
      ],
    ],
  };
  ```

  - `docsDir [default: docs]`: Specifies the path of the folder containing your documentation files.
  - `buildDir [default: build]`: Specifies the path of the output build folder.
  - `sourcesTag [default: sources]`: Specifies the sources tag name for .md files.
  - `referencesTag [default: references]`: Specifies the references tag name for .md files.

## 问题排查

