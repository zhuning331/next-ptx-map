/** @type {import('next').NextConfig} */
const debug = process.env.NODE_ENV !== 'production'

module.exports = {
  assetPrefix: !debug ? '/next-ptx-map/' : '',
}