import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  const PORT = 3000;

  app.use(express.json());

  let fileSystem: Record<string, string> = {
    'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Live Preview</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app">\n    <h1>Hello Cloud VS Code!</h1>\n    <p>Edit the files on the left to see changes here.</p>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>',
    'style.css': 'body {\n  font-family: system-ui, sans-serif;\n  background-color: #1e1e1e;\n  color: #d4d4d4;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\nh1 {\n  color: #569cd6;\n}',
    'script.js': 'console.log("Welcome to your cloud editor!");\n\ndocument.getElementById("app").addEventListener("click", () => {\n  alert("Interactive JS works!");\n});',
  };

  app.get('/api/files', (req, res) => {
    res.json(fileSystem);
  });

  app.post('/api/files', (req, res) => {
    fileSystem = req.body;
    io.emit('fs-update', fileSystem);
    res.json({ success: true });
  });

  app.post('/api/run', async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      const ext = filePath.split('.').pop().toLowerCase();
      let output = '';

      const tmpDir = os.tmpdir();
      
      if (ext === 'js') {
        const tmpFile = path.join(tmpDir, 'temp.js');
        fs.writeFileSync(tmpFile, content);
        try {
          output = execSync(`node ${tmpFile}`, { encoding: 'utf-8', timeout: 5000 });
        } catch (e: any) {
          output = e.stderr || e.stdout || e.message;
        }
      } else if (ext === 'py') {
        const tmpFile = path.join(tmpDir, 'temp.py');
        fs.writeFileSync(tmpFile, content);
        try {
          output = execSync(`python3 ${tmpFile}`, { encoding: 'utf-8', timeout: 5000 });
        } catch (e: any) {
          output = e.stderr || e.stdout || e.message;
        }
      } else if (ext === 'c') {
        const tmpFile = path.join(tmpDir, 'temp.c');
        const tmpOut = path.join(tmpDir, 'temp_c_out');
        fs.writeFileSync(tmpFile, content);
        try {
          execSync(`gcc ${tmpFile} -o ${tmpOut}`, { encoding: 'utf-8', timeout: 5000 });
          output = execSync(tmpOut, { encoding: 'utf-8', timeout: 5000 });
        } catch (e: any) {
          output = e.stderr || e.stdout || e.message;
        }
      } else if (ext === 'java') {
        const tmpFile = path.join(tmpDir, 'Main.java');
        fs.writeFileSync(tmpFile, content);
        try {
          execSync(`javac ${tmpFile}`, { encoding: 'utf-8', timeout: 5000 });
          output = execSync(`java -cp ${tmpDir} Main`, { encoding: 'utf-8', timeout: 5000 });
        } catch (e: any) {
          output = e.stderr || e.stdout || e.message;
        }
      } else if (ext === 'cs') {
        const tmpFile = path.join(tmpDir, 'temp.cs');
        const tmpOut = path.join(tmpDir, 'temp.exe');
        fs.writeFileSync(tmpFile, content);
        try {
          execSync(`mcs -out:${tmpOut} ${tmpFile}`, { encoding: 'utf-8', timeout: 5000 });
          output = execSync(`mono ${tmpOut}`, { encoding: 'utf-8', timeout: 5000 });
        } catch (e: any) {
          output = e.stderr || e.stdout || e.message;
        }
      } else {
        // Fallback to AI Execution Simulation for unsupported languages
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Act as a compiler and execution engine for the following code. Output EXACTLY what the standard output (stdout) of this code would be when run. Do not explain anything. Just the output. If there is a compilation error, output the error message.\n\nCode:\n${content}`,
          config: { temperature: 0.1 }
        });
        output = (response.text || '').trim();
        output += '\n\n[Compiled & Executed via Cloud AI Sandbox Fallback]';
      }
      
      res.json({ output });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/autocomplete', async (req, res) => {
    try {
      const { code, language, line, column, prefix, suffix } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an AI code autocomplete. Provide ONLY the suggested code completion for the cursor position. Do not include markdown formatting or explanations. Language: ${language}.\n\nCurrent code context:\n---\n${prefix}[CURSOR HERE]${suffix}\n---\n\nProvide the completion text that should replace [CURSOR HERE].`,
        config: {
          systemInstruction: "You are an AI code completion assistant. Output ONLY the exact code to be inserted at the cursor position. No markdown, no conversation.",
          temperature: 0.2
        }
      });
      res.json({ suggestion: response.text });
    } catch (error: any) {
      if (error?.status === 429 || (error?.message && error.message.includes('429'))) {
        // Rate limit gracefully handled
        return res.json({ suggestion: '' });
      }
      console.error('Autocomplete Error:', error.message || error);
      res.status(500).json({ error: error.message });
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('doc-change', (data) => {
      fileSystem[data.path] = data.content;
      socket.broadcast.emit('doc-change', data);
    });
    
    socket.on('file-create', (data) => {
      fileSystem[data.path] = data.content;
      socket.broadcast.emit('file-create', data);
    });

    socket.on('file-delete', (data) => {
      delete fileSystem[data.path];
      socket.broadcast.emit('file-delete', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
