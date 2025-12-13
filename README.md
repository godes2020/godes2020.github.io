# Void Clicker Game

A web-based incremental clicker game with user registration and database storage.

## Features

- User registration and authentication
- Persistent game state storage in SQLite database
- Clicker mechanics with upgrades and abilities
- Crafting system with materials
- Rebirth system for progression
- Responsive UI with dark theme

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URL=./game.db
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Online Deployment

### Heroku

1. Create a Heroku account at https://heroku.com
2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. Login to Heroku:
```bash
heroku login
```
4. Create a new app:
```bash
heroku create your-app-name
```
5. Deploy:
```bash
git push heroku main
```
6. Set environment variables on Heroku:
```bash
heroku config:set JWT_SECRET=your-super-secret-key-change-this-in-production
```
7. Open your app:
```bash
heroku open
```

### Railway

1. Go to https://railway.app
2. Connect your GitHub repository
3. Railway will automatically detect Node.js and deploy

### Vercel (with serverless functions)

Note: Vercel is primarily for static sites. For full functionality, use Heroku or Railway.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/game-state` - Get user's game state
- `POST /api/game-state` - Save user's game state

## Database Schema

- `users` table: id, username, password, created_at
- `game_states` table: id, user_id, game_data, updated_at

## Security

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Input validation for usernames and passwords

## Customization

### Adding Server Logo

1. Place your logo image in `public/images/logo.png` (or logo.jpg)
2. The logo will automatically appear at the top of login/registration screens
3. Recommended size: 200px width, PNG format with transparent background

### Game Assets

- All static files go in the `public/` directory
- Images: `public/images/`
- Styles: `public/css/` (if needed)
- Scripts: `public/js/` (if needed)