const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('.'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GitHub Guide API is running' });
});

// Proxy endpoint for AI API (Groq - better free tier)
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Support both Groq (default) and OpenAI (fallback)
        const groqApiKey = process.env.GROQ_API_KEY;
        const openaiApiKey = process.env.OPENAI_API_KEY;
        
        // Prefer Groq (better free tier), fallback to OpenAI if Groq key not set
        const useGroq = !!groqApiKey;
        const apiKey = useGroq ? groqApiKey : openaiApiKey;
        
        if (!apiKey) {
            console.error('No API key found. Please set GROQ_API_KEY or OPENAI_API_KEY');
            return res.status(500).json({ 
                error: 'Server configuration error: API key not found. Please set GROQ_API_KEY or OPENAI_API_KEY in environment variables.' 
            });
        }

        let apiUrl, requestBody;
        
        if (useGroq) {
            // Groq API - very generous free tier (30 requests/minute, 14,400 requests/day)
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            requestBody = {
                model: 'llama-3.1-8b-instant', // Fast and free
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful Git expert assistant. Provide clear, accurate, and practical Git advice.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            };
        } else {
            // OpenAI API (fallback)
            apiUrl = 'https://api.openai.com/v1/chat/completions';
            requestBody = {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful Git expert assistant. Provide clear, accurate, and practical Git advice.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            };
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`${useGroq ? 'Groq' : 'OpenAI'} API error:`, errorData);
            
            if (response.status === 401) {
                return res.status(500).json({ 
                    error: `Invalid API key. Please check your ${useGroq ? 'GROQ' : 'OPENAI'}_API_KEY in server configuration.` 
                });
            }
            
            if (response.status === 429) {
                return res.status(429).json({ 
                    error: 'Rate limit exceeded. Please try again in a moment.' 
                });
            }
            
            return res.status(response.status).json({ 
                error: errorData.error?.message || `${useGroq ? 'Groq' : 'OpenAI'} API request failed` 
            });
        }

        const data = await response.json();
        res.json({ content: data.choices[0].message.content });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error: ' + error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 GitHub Guide server running on port ${PORT}`);
    console.log(`📝 Make sure GROQ_API_KEY (recommended) or OPENAI_API_KEY is set in your environment variables`);
    if (process.env.GROQ_API_KEY) {
        console.log(`✅ Using Groq API (better free tier)`);
    } else if (process.env.OPENAI_API_KEY) {
        console.log(`⚠️  Using OpenAI API (limited free tier)`);
    }
});

