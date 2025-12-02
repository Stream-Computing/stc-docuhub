import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '希姆计算文档中心',
  tagline: '从这里出发，获取最新的产品文档和技术动态，一起探索前沿的技术趋势。',
  // favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Stream-Computing', // Usually your GitHub org/user name.
  projectName: 'stream-computing.github.io', // Usually your repo name.
  // deploymentBranch: 'main',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    // defaultLocale: 'en',
    // locales: ['en'],
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // id: 'pageAICard', // omitted => default instance
          path: 'docs/AI加速卡', // AI加速卡产品文档的源文件路径
          routeBasePath: 'AI加速卡', // AI加速卡产品文档的起始访问路径
          // sidebarPath: './sidebars.ts', // omitted => 默认展示AI加速卡产品文档的侧边栏
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // 增加文档多实例
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'pageAIAIO',
        path: 'docs/AI一体机', // AI一体机产品文档的源文件路径
        routeBasePath: 'AI一体机', // AI一体机产品文档的起始访问路径
        sidebarPath: './sidebarsAIAIO.ts', // AI一体机产品文档的独立侧边栏
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'pageAICloud',
        path: 'docs/智算云平台', // 智算云平台产品文档的源文件路径
        routeBasePath: '智算云平台', // 智算云平台产品文档的起始访问路径
        sidebarPath: './sidebarsAICloud.ts', // 智算云平台产品文档的独立侧边栏
      },
    ],

    // 增加文档关系图显示插件
    // [
    //   'docusaurus-graph',
    //   {
    //     docsDir: "docs",
    //     buildDir: "build",
    //     sourcesTag: "sources",
    //     referencesTag: "references",
    //   },
    // ],
  ],

  themes: [
    // ... Your other themes.
    [
      // 增加docusaurus-search-local本地搜索插件
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        docsRouteBasePath: ["AI加速卡", "AI一体机", "智算云平台"],

        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,

        // For Docs using Chinese, it is recomended to set:
        language: ["en", "zh"],

        // Customize the keyboard shortcut to focus search bar (default is "mod+k"):
        // searchBarShortcutKeymap: "s", // Use 'S' key
        // searchBarShortcutKeymap: "ctrl+shift+f", // Use Ctrl+Shift+F

        // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
        // forceIgnoreNoIndex: true,
      }),
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'STC Docs Hub',
      logo: {
        alt: '',
        src: 'img/stc_logo.svg',
      },
      // 为每个文档实例增加导航栏、关联侧边栏，并自定义显示的文档集版本
      // 一体机、智算云平台的文档尚未授权发布线上版本，暂时先不展示到导航栏
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'defaultSidebar',
          position: 'left',
          label: 'AI加速卡',
        },
        {
          type: 'docsVersionDropdown',
          versions: {
            '1.10.0': {label: 'v1.10.0'},
            '1.9.0': {label: 'v1.9.0'},
          },
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'AIAIOSidebar', // 在sidebarsXXX.ts文件中定义
        //   position: 'left',
        //   label: 'AI一体机',
        //   docsPluginId: 'pageAIAIO' // 非默认实例，需要用docsPluginId来关联侧边栏
        // },
        // {
        //   type: 'docsVersionDropdown',
        //   versions: {
        //     // current: {label: 'v1.1.0'},
        //     '1.0.0': {label: 'v1.0.0'},
        //   },
        //   docsPluginId: 'pageAIAIO'
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'AICloudSidebar', // 在sidebarsXXX.ts文件中定义
        //   position: 'left',
        //   label: '智算云平台',
        //   docsPluginId: 'pageAICloud' // 非默认实例，需要用docsPluginId来关联侧边栏
        // },
        // {
        //   type: 'docsVersionDropdown',
        //   versions: {
        //     // current: {label: 'v1.1.0'},
        //     '1.0.0': {label: 'v1.0.0'},
        //   },
        //   docsPluginId: 'pageAICloud'
        // },
        
        // 隐藏Blog和GitHub入口，等Phase 2建设完成后再开放
        // {
        //   to: '/blog',
        //   label: 'Blog',
        //   position: 'right'
        // },
        // {
        //   href: 'https://github.com/Stream-Computing/stream-computing.github.io',
        //   label: 'GitHub',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '希姆计算',
          items: [
            {
              label: '希姆计算官网',
              href: 'https://www.streamcomputing.com/',
            },
            {
              label: '关于希姆计算',
              href: 'https://www.streamcomputing.com/index.php?s=about&c=category&id=1#a1',
            },
            {
              label: '联系我们',
              href: 'https://streamcomputing.feishu.cn/docx/Bs9mdQYn3o2nbOxoP1ZcTR0fnRd',
            },
          ],
        },
        {
          title: '开源',
          items: [
            {
              label: '自研AI计算矩阵扩展指令集',
              href: 'https://github.com/riscv-stc/riscv-matrix-project',
            },
            {
              label: '百度飞桨 x 希姆计算AI模型库',
              href: 'https://github.com/Stream-Computing/STCPaddleModelZoo',
            },
          ],
        },
        {
          title: '资源',
          items: [
            {
              label: '产品文档下载',
              href: 'https://streamcomputing.feishu.cn/docx/YrUodaHr3oJ7ynx3oRNckmNLnZf',
            },
            {
              label: '希姆计算术语表',
              to: '/AI加速卡/希姆计算术语表',
            },
            {
              label: 'RISC-V International',
              href: 'https://riscv.org/members/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 广州希姆半导体科技有限公司Stream Computing Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },

    // 增加Algolia DocSearch搜索（官方推荐），Phase 1先用插件本地搜索方案，有需求再修改
    // algolia: {
    //   // The application ID provided by Algolia
    //   appId: '76PD0RLMHE',

    //   // Public API key: it is safe to commit it
    //   apiKey: '401f73f2bea271b1bb85da52966e7c72',

    //   indexName: 'STC Docs Hub',

    //   // Optional: see doc section below
    //   contextualSearch: true,

    //   // // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
    //   // externalUrlRegex: 'external\\.com|domain\\.com',

    //   // // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
    //   // replaceSearchResultPathname: {
    //   //   from: '/docs/', // or as RegExp: /\/docs\//
    //   //   to: '/',
    //   // },

    //   // // Optional: Algolia search parameters
    //   // searchParameters: {},

    //   // // Optional: path for search page that enabled by default (`false` to disable it)
    //   // searchPagePath: 'search',

    //   // // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
    //   // insights: false,

    //   // // Optional: whether you want to use the new Ask AI feature (undefined by default)
    //   // askAi: 'YOUR_ALGOLIA_ASK_AI_ASSISTANT_ID',

    //   //... other Algolia params
    // },
  } satisfies Preset.ThemeConfig,
};

export default config;
