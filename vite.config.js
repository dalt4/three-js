// vite.config.js

export default ({
    build: {
        rollupOptions: {
            input: {
                main: './index.html',
                dynamicEnv: './dynamic-env/index.html',
                modernShader: './dynamic-env/index.html'
            }
        }
    }
})