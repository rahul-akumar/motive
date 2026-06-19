export default {
  '*.{ts,tsx,vue,js,mjs,cjs,json,md,css}': ['prettier --write'],
  // Enforce design-token color usage on staged styles (see @motive/stylelint-config).
  '*.{css,vue}': ['stylelint'],
}
