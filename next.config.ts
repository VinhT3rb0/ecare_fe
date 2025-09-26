/** @type {import('next').NextConfig} */
const withAntdLess = require("next-plugin-antd-less");

module.exports = withAntdLess({
  reactStrictMode: false,
  images: {
    domains: ["res.cloudinary.com"],
  },
  devIndicators: {
    buildActivity: false,
  },
});
