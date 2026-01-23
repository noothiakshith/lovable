import { Template, waitForURL } from 'e2b'
import 'dotenv/config'


export const template = Template({ fileContextPath: '.' })
  .fromTemplate("code-interpreter-v1")
  .setWorkdir('/home/user')
  .runCmd('npm create vite@latest app -- --template react')
  .setWorkdir('/home/user/app')
  .runCmd('npm install')
  .runCmd('npm install -D tailwindcss@3 postcss autoprefixer')
  .runCmd('npx tailwindcss init -p')