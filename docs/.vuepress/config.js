import { defineUserConfig } from 'vuepress';
import { defaultTheme } from 'vuepress'
import { searchPlugin } from '@vuepress/plugin-search'
import zoomingPlugin from 'vuepress-plugin-zooming';

export default defineUserConfig({
  locales: {
    "/": {
      lang: "en-US",
      title: "网站应用防火墙(WAF)",
      description: "Expose your services easily and securely",
    },
  },
  head: [
    ["link", { rel: "icon", href: "/icon.png" }],
    ["meta", { name: "description", content: "Docker container and built in Web Application for managing Nginx proxy hosts with a simple, powerful interface, providing free SSL support via Let's Encrypt" }],
    ["meta", { property: "og:title", content: "网站应用防火墙(WAF)" }],
    ["meta", { property: "og:description", content: "Docker container and built in Web Application for managing Nginx proxy hosts with a simple, powerful interface, providing free SSL support via Let's Encrypt"}],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:url", content: "https://clouddream.net/" }],
    ["meta", { name: "twitter:card", content: "summary"}],
    ["meta", { name: "twitter:title", content: "网站应用防火墙(WAF)"}],
    ["meta", { name: "twitter:description", content: "Docker container and built in Web Application for managing Nginx proxy hosts with a simple, powerful interface, providing free SSL support via Let's Encrypt"}],
    ["meta", { name: "twitter:alt", content: "网站应用防火墙(WAF)"}],
  ],
  theme: defaultTheme({
    logo: '/icon.png',
    repo: "jc21/nginx-proxy-manager",
    docsRepo: 'https://github.com/jc21/nginx-proxy-manager',
    docsBranch: 'develop',
    docsDir: 'docs',
    editLinkPattern: ':repo/edit/:branch/:path',
    locales: {
      '/': {
        label: 'English',
        selectLanguageText: 'Languages',
        selectLanguageName: 'English',
        editLinkText: 'Edit this page on GitHub',
        navbar: [
          { text: 'Setup', link: '/setup/' }
        ],
        sidebar: {
          '/': [
            {
              text: 'Home',
              link: '/'
            },
            { 
              text: 'Guide',
              link: '/guide/',
              collapsible: true,
            },
            {
              text: 'Screenshots',
              link:  '/screenshots/',
              collapsible: true,
            },
            {
              text: 'Setup Instructions',
              link: '/setup/',
              collapsible: true,
            },
            {
              text: 'Advanced Configuration',
              link: '/advanced-config/',
              collapsible: true,
            },
            {
              text: 'Upgrading',
              link: '/upgrading/',
              collapsible: true,
            },
            {
              text: 'Frequently Asked Questions',
              link: '/faq/',
              collapsible: true,
            },
            {
              text: 'Third Party',
              link: '/third-party/',
              collapsible: true,
            },
          ],
        },
      }
    }
  }),
  markdown: {
    code: {
      lineNumbers: false,
    },
  },
  plugins: [
    zoomingPlugin({
      selector: '.zooming',
      delay: 1000,
      options: {
        bgColor: 'black',
        zIndex: 10000,
      },
    }),
    searchPlugin({
      locales: {
        '/': {
          placeholder: 'Search',
        },
      },
    }),
  ],
});
