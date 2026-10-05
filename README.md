# Inventario de equipos hospitalarios

## Requisitos
- Node.js 18+
- MongoDB en local (mongodb://127.0.0.1:27017) o una URI de MongoDB Atlas

## Puesta en marcha
1. `npm install`
2. Copie `.env.example` a `.env` y cambie `JWT_SECRET`
3. Edite los nombres de los hospitales en `seed.js`
4. `npm run seed`  → crea los 10 hospitales y sus usuarios (ver `credenciales.txt`)
5. `npm start`  → http://localhost:3000
