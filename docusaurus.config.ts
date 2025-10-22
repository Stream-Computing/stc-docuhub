import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '希姆计算文档中心',
  tagline: '从这里出发，获取最新的产品文档和产品动态，一起探索前沿的技术趋势。',
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
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
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
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'AI加速卡',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'AI一体机',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '智算云平台',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'right'
        },
        {
          href: 'https://github.com/Stream-Computing/stream-computing.github.io',
          label: 'GitHub',
          position: 'right',
        },
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
              href: 'https://www.streamcomputing.com/',
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
              label: 'RISC-V International',
              href: 'https://riscv.org/',
            },
            {
              label: '希姆计算术语表',
              to: '/docs/希姆计算术语表',
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
  } satisfies Preset.ThemeConfig,
};

export default config;
