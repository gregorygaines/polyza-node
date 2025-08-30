import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './gitea-1.24-openapi-spec.yaml',
  output: 'src/generated',
});
