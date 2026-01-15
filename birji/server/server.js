import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import cookieParser from 'cookie-parser';


import {
    registerUser,
    loginUser
} from './db.js'; // Pfad ggf. anpassen



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;


//Middelware & Settings
//region
const JWT_SECRET = "8f2c0a9b6d4f5e1a2c3b7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9";

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
//endregion


//TOKENS
//region
// JWT Middleware - liest Token aus Header oder Cookie
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    const tokenFromCookie = req.cookies.jwt;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) return res.status(401).json({ error: 'Token fehlt' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token ungültig' });
        req.user = user; // user enthält gpnr und role
        next();
    });
}

function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Nur für Admins erlaubt' });
    }
    next();
}
//endregion


app.post('/api/auth/register', async (req, res) => {
    const { username, password, text } = req.body;

    console.log("attempted registration")

    if (!username || !password) {
        return res.status(400).json({ error: 'Username und Passwort erforderlich' });
    }

    try {
        const user = await registerUser(username, password, text);

        if (!user) {
            return res.status(409).json({ error: 'User existiert bereits' });
        }

        // JWT erzeugen
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: 'user'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Cookie setzen
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false, // in prod: true (HTTPS)
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                elo: user.elo,
                text: user.text
            },
            token
        });
    } catch (err) {
        console.error('Register Fehler:', err.message);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    console.log("attempted login")

    if (!username || !password) {
        return res.status(400).json({ error: 'Username und Passwort erforderlich' });
    }

    try {
        const user = await loginUser(username, password);

        if (!user) {
            return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: 'user'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                elo: user.elo,
                text: user.text
            },
            token
        });
    } catch (err) {
        console.error('Login Fehler:', err.message);
        res.status(500).json({ error: 'Serverfehler' });
    }
});




// Server starten
app.listen(port, '0.0.0.0', () => {
    console.log(`Server läuft auf Port ${port}`);
});

// Sicherer Shutdown
process.on('SIGINT', async () => {
    console.log("Server wird beendet...");
    await end();
    process.exit(0);
});
