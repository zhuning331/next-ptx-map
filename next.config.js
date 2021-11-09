/** @type {import('next').NextConfig} */
const withTm = require("next-transpile-modules")([
  "ol-ext"
]);
const compose = require("next-compose");
module.exports = compose([
  [withTm],
  {
    reactStrictMode: true,
  }
])
