/** @type {import('next').NextConfig} */
const withAntdLess = require("next-plugin-antd-less");

module.exports = withAntdLess({
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
  lessVarsFilePath: "./src/styles/antd-theme.less",
  modifyVars: {
    "@primary-color": "#11A998",
  },
});
