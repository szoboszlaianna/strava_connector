# Strava MCP Server

An MCP (Model Context Protocol) server that integrates with Strava to provide access to your running and cycling data through Claude Desktop. Features **automatic OAuth token management** and **metric units** for European users.

## Features

- **OAuth Token Management**: Automatic token refresh with secure credential storage
- **Natural Language Queries**: Ask Claude questions like "How was my latest run?" or "How many kms did I run this month?"
- **Metric Units**: All data displayed in kilometers, meters, km/h, and min/km pace
- **Rich Data Access**: Recent activities, detailed activity information, monthly statistics, and custom date ranges
- **Automatic Authentication**: Handles token expiration and refresh seamlessly

## Available Tools

1. **get_recent_activities** - Get your recent Strava activities with filtering options
2. **get_activity_details** - Get detailed information about a specific activity
3. **get_athlete_profile** - Get your athlete profile and basic information
4. **get_monthly_stats** - Get comprehensive monthly statistics and trends
5. **get_activities_by_date_range** - Get activities within a specific date range
6. **check_oauth_status** - Check and refresh OAuth tokens (for debugging)

## Setup

### Prerequisites

You'll need to create a Strava application to get OAuth credentials:

1. **Create Strava Application**:
   - Go to https://www.strava.com/settings/api
   - Click "Create & Manage Your App"
   - Fill in the application details:
     - **Application Name**: "My Strava MCP Server" (or any name)
     - **Category**: Choose appropriate category
     - **Club**: Leave blank unless needed
     - **Website**: Can use http://localhost:3000
     - **Authorization Callback Domain**: `localhost` (for local setup)
   - Click "Create"

2. **Get Your Credentials**:
   - Note your **Client ID** and **Client Secret** from the app page

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Strava OAuth credentials:

   ```env
   STRAVA_CLIENT_ID=your_client_id_here
   STRAVA_CLIENT_SECRET=your_client_secret_here

   # These will be populated by the OAuth setup process
   STRAVA_ACCESS_TOKEN=
   STRAVA_REFRESH_TOKEN=
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

### OAuth Authorization

**First-time setup** (run this once):

1. **Start the OAuth setup**:

   ```bash
   npm run oauth-setup
   ```

2. **Follow the instructions**:
   - Open the provided authorization URL in your browser
   - Grant permissions to your application
   - Copy the authorization code from the redirect URL
   - Run the command with your authorization code:

   ```bash
   npm run oauth-setup YOUR_AUTHORIZATION_CODE
   ```

3. **Update your .env file**:
   - The script will output the access and refresh tokens
   - Add them to your `.env` file

**Example OAuth setup process**:

```bash
$ npm run oauth-setup
🚀 Strava OAuth Setup
📍 Step 1: Open this URL in your browser:
https://www.strava.com/oauth/authorize?client_id=12345...

📍 Step 2: After authorization, you'll be redirected to a URL like:
http://localhost:3000?code=abc123def456...

📍 Step 3: Copy the 'code' parameter and run:
npm run oauth-setup abc123def456

$ npm run oauth-setup abc123def456
✅ Successfully obtained tokens!
📋 Add these to your .env file:
STRAVA_ACCESS_TOKEN=your_access_token_here
STRAVA_REFRESH_TOKEN=your_refresh_token_here
```

## Usage with Claude Desktop

Add this server to your Claude Desktop MCP configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "strava": {
      "command": "node",
      "args": ["/path/to/your/strava_connector/build/index.js"],
      "env": {
        "STRAVA_CLIENT_ID": "your_client_id",
        "STRAVA_CLIENT_SECRET": "your_client_secret",
        "STRAVA_ACCESS_TOKEN": "your_access_token",
        "STRAVA_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

## Example Questions

Once connected, you can ask Claude questions like:

### Activity Questions

- "How was my latest run?"
- "What activities did I do this week?"
- "Show me my longest run from the past month"
- "What was my pace on my run yesterday?"

### Performance Analysis

- "What's my average pace this month?"
- "How many kilometers have I run this week?"
- "How does my recent performance compare to last month?"
- "Which run had the most elevation gain recently?"

### Monthly & Historical Data

- "Give me stats for December 2024"
- "What activities did I do between January 1st and January 15th?"
- "Show me all my cycling activities from last month"

## OAuth Token Management

The server **automatically handles token refresh**:

- ✅ **Automatic Refresh**: Tokens are refreshed automatically before expiration
- ✅ **Persistent Storage**: Updated tokens are saved to `.strava_tokens.json`
- ✅ **Error Handling**: Graceful handling of authentication failures
- ✅ **Token Validation**: Checks token expiry and refreshes proactively

### Manual Token Management

If you need to check or refresh tokens manually:

```bash
# Through Claude Desktop (ask Claude):
"Can you check my Strava OAuth status?"

# Or test directly:
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_oauth_status","arguments":{}}}' | node build/index.js
```

## Data Format (Metric Units)

All data is presented in metric units:

```json
{
  "distance": {
    "kilometers": "8.43",
    "meters": 8430
  },
  "pace": {
    "per_km": "4:41/km"
  },
  "speed": {
    "average_kmh": "13.0 km/h",
    "max_kmh": "18.5 km/h"
  },
  "elevation": {
    "gain_meters": "500 m",
    "highest_point": "1200 m",
    "lowest_point": "700 m"
  }
}
```

## Troubleshooting

### Common Issues

1. **"Strava authentication failed"**:
   - Check that your OAuth credentials are correct in `.env`
   - Ensure tokens haven't been revoked in Strava settings
   - Try the OAuth setup process again

2. **"Failed to refresh tokens"**:
   - Your refresh token may be invalid
   - Re-run the OAuth setup process: `npm run oauth-setup`

3. **"Rate limit exceeded"**:
   - Strava API has rate limits (100 requests per 15 minutes, 1000 per day)
   - Wait before making more requests

4. **MCP server not appearing in Claude Desktop**:
   - Ensure the path to `build/index.js` is correct in your config
   - Check that the build was successful (`npm run build`)
   - Restart Claude Desktop after updating the configuration

### Debug Mode

You can test the server manually:

```bash
# Test OAuth status
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_oauth_status","arguments":{}}}' | node build/index.js

# Test getting recent activities
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_recent_activities","arguments":{"limit":5,"activity_type":"Run"}}}' | node build/index.js
```

### Token Storage

- Tokens are stored in `.strava_tokens.json` (automatically created)
- This file is updated automatically when tokens refresh
- **Keep this file secure** - it contains your access credentials

## Security Notes

- **Never commit** your `.env` file or `.strava_tokens.json` to version control
- OAuth tokens are stored locally and refreshed automatically
- The server only accesses data you've explicitly authorized
- All communication is direct between your server and Strava API

## Contributing

Feel free to open issues or submit pull requests to improve the server!

## License

MIT License - see LICENSE file for details.
