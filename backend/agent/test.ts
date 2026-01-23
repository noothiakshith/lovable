import 'dotenv/config'
import { Sandbox } from '@e2b/code-interpreter'

export const main = async () => {
    const sandbox = await Sandbox.create('sathwik-dev');
    console.log(sandbox.sandboxId)
   await sandbox.files.write('/home/user/app/vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true
  }
})
`)
    await sandbox.commands.run('npm run dev ',{
        background:true
        
    })
    await new Promise(resolve => setTimeout(resolve, 3000))
    const host = sandbox.getHost(5173)
    console.log(`https://${host}`)
}

main().catch(console.error)