// vite.config.js

export default ({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        dynamicEnv: './dynamic-env/index.html',
        modernShader: './modern-shader/index.html',
        godRaysVertex: './god-rays-vertex/index.html',
        crystal: './crystal/index.html',
        new: './new/index.html',
        access: './access/index.html',
        diamond: './crystal2/index.html',
        outline: './outline/index.html'
      }
    }
  }
})
