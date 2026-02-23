

export function registerAIRoutes(app) {
    app.get('/api/ai/', (req, res) => {
        //TODO: GET of all available bots
    })

    app.post('/api/ai/coach', (req, res) => {
        //TODO: POST to ollama
    })

    app.post('/api/ai/bots', (req, res) => {
        //TODO: POST to python backend with playable bots
    })
}