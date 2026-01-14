import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'my_database',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 200,
    queueLimit: 0
});


(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to DB via pool!');
        connection.release();
    } catch (err) {
        console.error('Fehler beim Verbinden mit der Datenbank:', err.message);
    }
})();



export async function checkIfUsernameExists(username) {
    try {
        const [results] = await pool.query(
            "SELECT COUNT(*) AS count FROM users WHERE username = ?",
            [username]
        );
        return results[0].count > 0;
    } catch (err) {
        console.error('Fehler bei Username-Prüfung:', err.message);
        throw err;
    }
}


export async function registerUser(username, passwort, text = '', elo = 1000) {
    const exists = await checkIfUsernameExists(username);
    if (exists) {
        console.log(`User ${username} existiert bereits.`);
        return null;
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO users (username, passwort, elo, text)
             VALUES (?, ?, ?, ?)`,
            [username, passwort, elo, text]
        );

        return {
            id: result.insertId,
            username,
            elo,
            text
        };
    } catch (err) {
        console.error('Fehler beim Registrieren:', err.message);
        throw err;
    }
}


export async function loginUser(username, password) {
    try {
        const [results] = await pool.query(
            "SELECT id, username, passwort, elo, text FROM users WHERE username = ?",
            [username]
        );

        if (!results.length) return false;

        const user = results[0];

        if (user.passwort !== password) return false;

        // Passwort korrekt → Userdaten zurückgeben
        return {
            id: user.id,
            username: user.username,
            elo: user.elo,
            text: user.text
        };
    } catch (err) {
        console.error('Fehler beim Login:', err.message);
        throw err;
    }
}


export async function getUserByUsername(username) {
    try {
        const [results] = await pool.query(
            "SELECT id, username, elo, text FROM users WHERE username = ?",
            [username]
        );
        return results.length ? results[0] : null;
    } catch (err) {
        console.error('Fehler beim Abrufen des Users:', err.message);
        throw err;
    }
}
