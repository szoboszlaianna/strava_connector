#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  getRecentActivitiesTool,
  getActivityDetailsTool,
  getAthleteProfileTool,
  getMonthlySatsTool,
  getActivitiesByDateRangeTool,
} from "./tools/index.js";

// Create and configure the server
const server = new McpServer({
  name: "strava-connector",
  version: "1.0.0",
});

// Register tools
server.registerTool(
  "get_recent_activities",
  {
    description: getRecentActivitiesTool.description,
    inputSchema: getRecentActivitiesTool.inputSchema,
  },
  getRecentActivitiesTool.handler,
);

server.registerTool(
  "get_activity_details",
  {
    description: getActivityDetailsTool.description,
    inputSchema: getActivityDetailsTool.inputSchema,
  },
  getActivityDetailsTool.handler,
);

server.registerTool(
  "get_athlete_profile",
  {
    description: getAthleteProfileTool.description,
    inputSchema: getAthleteProfileTool.inputSchema,
  },
  getAthleteProfileTool.handler,
);

server.registerTool(
  "get_monthly_stats",
  {
    description: getMonthlySatsTool.description,
    inputSchema: getMonthlySatsTool.inputSchema,
  },
  getMonthlySatsTool.handler,
);

server.registerTool(
  "get_activities_by_date_range",
  {
    description: getActivitiesByDateRangeTool.description,
    inputSchema: getActivitiesByDateRangeTool.inputSchema,
  },
  getActivitiesByDateRangeTool.handler,
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log server start (to stderr so it doesn't interfere with MCP protocol)
  console.error("Strava MCP Server started successfully!");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

