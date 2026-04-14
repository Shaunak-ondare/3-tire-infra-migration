# 3-Tier App

This project is a simple 3-tier application with:

- A static frontend in `frontend/`
- A Node.js + Express backend in `backend/`
- A PostgreSQL database hosted on AWS RDS

The frontend lets you add and view user records. The backend exposes API routes, and PostgreSQL stores the data permanently.

## Project Structure

```text
3-tire-app/
|-- frontend/
|   |-- index.html
|   |-- style.css
|   `-- app.js
`-- backend/
    |-- package.json
    |-- server.js
    `-- .env
```

## High-Level Setup

1. Create a PostgreSQL database in AWS RDS.
2. Launch an EC2 instance for the application server.
3. Upload this project to the EC2 instance.
4. Install Node.js, npm, PM2, and Nginx on EC2.
5. Configure the backend `.env` to point to RDS.
6. Start the backend with PM2.
7. Copy the frontend files into Nginx's web root.
8. Configure Nginx to serve the frontend and proxy `/api` to the backend.

## Backend Environment Variables

Create `backend/.env` with values like these:

```env
PORT=3000
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USER=app_user
DB_PASSWORD=your_password
DB_NAME=three_tier_app
```

## Step-by-Step: Set Up PostgreSQL on AWS RDS

### 1. Create the RDS database

In AWS Console:

1. Open `RDS`.
2. Click `Create database`.
3. Choose `PostgreSQL`.
4. Select `Free tier` or the instance size you want.
5. Set:
   - DB instance identifier: `three-tier-db`
   - Master username: `postgres` or your preferred admin user
   - Master password: choose a strong password
6. Under connectivity:
   - Choose the same VPC as your EC2 instance
   - Set public access based on your network plan
7. Create the database and wait until status becomes `Available`.

### 2. Allow EC2 to reach RDS

Make sure the RDS security group allows inbound traffic on port `5432` from your backend EC2 instance.

The safest approach:

1. Open the RDS security group.
2. Add an inbound rule:
   - Type: `PostgreSQL`
   - Port: `5432`
   - Source: the EC2 instance security group

### 3. Connect to RDS from EC2

SSH into EC2 and use `psql`:

```bash
psql --version
```

If `psql` is not installed:

```bash
sudo apt update
sudo apt install -y postgresql-client
```

Then connect:

```bash
PGPASSWORD='your_password' psql -h your-rds-endpoint.amazonaws.com -U postgres -d postgres
```

### 4. Create the application database and user

Inside `psql`, run:

```sql
CREATE DATABASE three_tier_app;
CREATE USER app_user WITH PASSWORD 'your_app_password';
GRANT ALL PRIVILEGES ON DATABASE three_tier_app TO app_user;
```

Reconnect to the app database:

```bash
PGPASSWORD='your_password' psql -h your-rds-endpoint.amazonaws.com -U postgres -d three_tier_app
```

Then grant schema privileges:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

### 5. Add RDS values to the backend

Update `backend/.env`:

```env
PORT=3000
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USER=app_user
DB_PASSWORD=your_app_password
DB_NAME=three_tier_app
```

This project's backend uses SSL when connecting to PostgreSQL, which is needed for many RDS setups.

### 6. Verify the database connection

After the backend is running, test with:

```bash
curl http://127.0.0.1:3000/api/users
```

To verify the data is really in PostgreSQL and not in memory:

```bash
PGPASSWORD='your_app_password' psql -h your-rds-endpoint.amazonaws.com -U app_user -d three_tier_app
```

Then:

```sql
SELECT * FROM users ORDER BY id DESC;
```

To remove all records:

```sql
TRUNCATE TABLE users RESTART IDENTITY;
```

## Step-by-Step: Deploy the Project on EC2

### 1. SSH into EC2

```bash
ssh -i /path/to/key.pem ubuntu@your-ec2-public-ip
```

### 2. Upload the project

You can upload with `scp`, Git, or any other method. Example:

```bash
scp -i /path/to/key.pem -r ./3-tire-app ubuntu@your-ec2-public-ip:~/
```

### 3. Install Node.js

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 4. Install backend dependencies

```bash
cd ~/3-tire-app/backend
npm install
```

### 5. Start the backend with PM2

Install PM2:

```bash
sudo npm install -g pm2
```

Start the backend:

```bash
cd ~/3-tire-app/backend
pm2 start npm --name backend -- start
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`, then save again:

```bash
pm2 save
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs backend --lines 100
pm2 restart backend
pm2 stop backend
```

## Step-by-Step: Serve Frontend with Nginx

### 1. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Copy frontend files into Nginx web root

```bash
sudo cp -r ~/3-tire-app/frontend/* /var/www/html/
```

### 3. Configure Nginx

Edit:

```bash
sudo nano /etc/nginx/sites-available/default
```

Use this config:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then test and restart:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Open the right ports

In your EC2 security group, allow:

- `22` for SSH
- `80` for HTTP

## Important Frontend Note

The frontend should call the backend with a relative path:

```js
const apiBaseUrl = '/api/users';
```

Do not use:

```js
http://localhost:3000/api/users
```

In a browser, `localhost` refers to the visitor's own machine, not your EC2 server.

## Local Development

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

Open `frontend/index.html` in a browser, or serve it with any static server.

## Quick Verification Checklist

1. `pm2 status` shows `backend` as `online`
2. `curl http://127.0.0.1:3000/api/users` returns JSON
3. `curl http://localhost/api/users` returns JSON through Nginx
4. Opening the EC2 public IP loads the frontend
5. Adding a user from the UI stores it in RDS
6. Running `SELECT * FROM users;` in `psql` shows the same data

## Troubleshooting

### `Cannot find module 'express'`

Run:

```bash
cd backend
npm install
```

### Backend crashes with database connection errors

Check:

- `backend/.env` values
- RDS endpoint is correct
- RDS security group allows port `5432` from EC2
- Database/user/password are correct

### Frontend says `Failed to fetch`

Check:

- Nginx is running
- `frontend/app.js` uses `/api/users`
- `location /api/` exists in the Nginx config
- `pm2 status` shows the backend is online

## Infrastructure as Code Capture

If you need to bring the existing EC2 and RDS setup under Terraform and Ansible without changing the live environment, use the files in [`infra/`](./infra/README.md).

That workspace is intentionally set up for:

- Terraform import and state inspection only
- Ansible inventory and read-only audits only
- no applies, no restarts, and no configuration drift on purpose
