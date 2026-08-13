import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';

function oracleApiPlugin(): Plugin {
  return {
    name: 'oracle-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/oracle', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { prompt, context } = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  text: 'A chave da sabedoria cósmica (GEMINI_API_KEY) ainda não foi configurada nas variáveis de ambiente. No entanto, os oráculos tradicionais (Tarô, I Ching, Runas, Numerologia e Astrologia) permanecem totalmente funcionais com a sabedoria ancestral nativa!',
                  status: 'no_key',
                })
              );
              return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const systemInstruction = `Você é a Sacerdotisa e Oráculo Supremo do "Oráculos.TS", um portal místico de divinação, astrologia e filosofia hermética.
Sua linguagem é acolhedora, misteriosa, poética, profunda e empoderadora.
Responda em Português com estrutura clara (use negritos, parágrafos curtos, um conselho prático e um mantra final).
Se houver tiragens ou dados fornecidos no contexto (como cartas de Tarô, hexagramas do I Ching ou runas), incorpore-os em uma síntese harmônica.`;

            const fullPrompt = `${context ? `[Contexto da Tiragem/Consulta: ${JSON.stringify(context)}]\n\n` : ''}Pergunta/Reflexão do Consulente: ${prompt || 'Forneça um conselho oracular para o momento presente.'}`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: fullPrompt,
              config: {
                systemInstruction,
                temperature: 0.8,
              },
            });

            const replyText = response.text || 'O oráculo silenciou por um instante, mas os ventos trazem renovação.';

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ text: replyText, status: 'success' }));
          } catch (error: any) {
            console.error('Oracle API Error:', error);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(
              JSON.stringify({
                error: 'Erro ao consultar o oráculo estelar.',
                details: error?.message || 'Erro desconhecido',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), oracleApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
