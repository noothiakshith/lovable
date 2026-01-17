import { Template } from 'e2b'

export const template = Template()
  .fromImage('e2bdev/code-interpreter:latest')

  // WORKDIR /home/user
  .setWorkdir('/home/user')

  // Create Vite app in a NEW directory
  .runCmd('npm create vite@latest app -- --template react --yes')

  // Move into app
  .setWorkdir('/home/user/app')

  // Install deps
  .runCmd('npm install')
