import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['coverage/**', 'dist/**', 'example/**']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended
)
