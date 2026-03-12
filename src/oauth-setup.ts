#!/usr/bin/env node

/**
 * Strava OAuth Setup Helper
 *
 * This script helps you get the initial OAuth tokens from Strava.
 * It starts a local server to handle the OAuth callback automatically.
 * Run this once to set up your initial authorization.
 */

import axios from "axios";
import dotenv from "dotenv";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import { exec } from "child_process";

dotenv.config();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
  console.error("❌ Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET in .env file");
  process.exit(1);
}

async function exchangeCodeForTokens(authorizationCode: string): Promise<{ access_token: string, refresh_token: string, expires_at: number, athlete: any }> {
  try {
    console.log("🔄 Exchanging authorization code for tokens...");

    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code: authorizationCode,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_at, athlete } = response.data;

    console.log("✅ Successfully obtained tokens!");
    console.log("\n📋 Add these to your .env file:");
    console.log("=====================================");
    console.log(`STRAVA_ACCESS_TOKEN=${access_token}`);
    console.log(`STRAVA_REFRESH_TOKEN=${refresh_token}`);
    console.log("=====================================");
    console.log(`\n👤 Authorized athlete: ${athlete.firstname} ${athlete.lastname}`);
    console.log(`⏰ Token expires at: ${new Date(expires_at * 1000).toLocaleString()}`);
    console.log(`\n🎉 Setup complete! You can now use the Strava MCP server.`);

    return { access_token, refresh_token, expires_at, athlete };

  } catch (error: any) {
    console.error("❌ Failed to exchange code for tokens:");
    if (error.response?.data) {
      console.error(error.response.data);
      throw new Error(`OAuth exchange failed: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
      throw error;
    }
  }
}

function createSuccessPage(athlete: any, expiresAt: number): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strava OAuth Success</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .success-icon {
            font-size: 64px;
            color: #fc4c02;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .athlete-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .next-steps {
            background: #e7f5e7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            text-align: left;
        }
        .code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">🎉</div>
        <h1>Strava Authorization Successful!</h1>
        <p>Your Strava account has been successfully connected to the MCP server.</p>

        <div class="athlete-info">
            <h3>👤 Authorized Account</h3>
            <p><strong>${athlete.firstname} ${athlete.lastname}</strong></p>
            <p><small>Token expires: ${new Date(expiresAt * 1000).toLocaleString()}</small></p>
        </div>

        <div class="next-steps">
            <h3>✅ Next Steps</h3>
            <p>1. The tokens have been automatically saved to your console output</p>
            <p>2. Copy the <span class="code">STRAVA_ACCESS_TOKEN</span> and <span class="code">STRAVA_REFRESH_TOKEN</span> to your <span class="code">.env</span> file</p>
            <p>3. Your Strava MCP server is now ready to use!</p>
        </div>

        <p><small>You can close this window now. The server will shut down automatically.</small></p>
    </div>
</body>
</html>`;
}

function createErrorPage(error: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strava OAuth Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .error-icon {
            font-size: 64px;
            color: #dc3545;
            margin-bottom: 20px;
        }
        .error-details {
            background: #f8d7da;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #dc3545;
            text-align: left;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">❌</div>
        <h1>Authorization Error</h1>
        <p>There was a problem with the Strava authorization process.</p>

        <div class="error-details">
            <p><strong>Error:</strong> ${error}</p>
        </div>

        <p>Please try running the setup script again and make sure you accept the authorization on Strava.</p>
    </div>
</body>
</html>`;
}

function openBrowser(url: string): void {
  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} "${url}"`);
}

async function startOAuthServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        if (!req.url) {
          res.writeHead(400);
          res.end('Bad Request');
          return;
        }

        const url = new URL(req.url, `http://localhost:${PORT}`);

        if (url.pathname === '/') {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            console.error(`❌ OAuth error: ${error}`);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(createErrorPage(error));
            server.close();
            reject(new Error(`OAuth error: ${error}`));
            return;
          }

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(createErrorPage('No authorization code received'));
            server.close();
            reject(new Error('No authorization code received'));
            return;
          }

          try {
            // Exchange code for tokens
            const tokens = await exchangeCodeForTokens(code);

            // Send success page
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(createSuccessPage(tokens.athlete, tokens.expires_at));

            // Close server after a short delay
            setTimeout(() => {
              server.close();
              resolve();
            }, 2000);

          } catch (tokenError: any) {
            console.error(`❌ Token exchange failed: ${tokenError.message}`);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(createErrorPage(tokenError.message));
            server.close();
            reject(tokenError);
          }
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      } catch (error: any) {
        console.error(`❌ Server error: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(createErrorPage(error.message));
        server.close();
        reject(error);
      }
    });

    server.listen(PORT, () => {
      console.log(`🌐 OAuth server started on ${REDIRECT_URI}`);

      const scopes = "read,read_all,profile:read_all,activity:read_all";
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scopes}`;

      console.log("🚀 Strava OAuth Setup");
      console.log("======================");
      console.log(`\n🔗 Opening authorization URL: ${authUrl}`);
      console.log("\n📱 Your browser should open automatically.");
      console.log("   If it doesn't, copy and paste the URL above.");
      console.log("\n⏳ Waiting for authorization...");

      // Open browser automatically
      openBrowser(authUrl);
    });

    server.on('error', (error) => {
      reject(error);
    });
  });
}

async function main(): Promise<void> {
  try {
    await startOAuthServer();
    console.log("\n🎉 OAuth setup completed successfully!");
    console.log("📝 Don't forget to update your .env file with the tokens shown above.");
  } catch (error: any) {
    console.error("\n❌ OAuth setup failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main().catch(console.error);
