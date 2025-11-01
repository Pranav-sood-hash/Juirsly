# AI Legal Assistant Website

This is a code bundle for AI Legal Assistant Website. The original project is available at https://www.figma.com/design/YgQoQYnO0MQkWG1u42bhTi/AI-Legal-Assistant-Website.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

**IMPORTANT:** The application requires Supabase credentials to run.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project (or use an existing one)
   - Navigate to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**

3. Update the `.env` file with your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Troubleshooting

### White Screen Issue

If you see a white screen when opening the application, it's likely because the Supabase environment variables are not configured. Make sure you:

1. Created the `.env` file in the project root
2. Added valid Supabase credentials
3. Restarted the development server after creating the `.env` file

### Authentication Setup

For detailed instructions on setting up authentication, email verification, and password reset functionality, see [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md).

## Building for Production

```bash
npm run build
```

The built files will be in the `build` directory.
