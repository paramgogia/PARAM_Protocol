"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertTriangle, Cpu, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Example Netflix JSON to guide the user
const placeholderNetflixData = `{
  "membershipDetails": { "planType": "Basic plan" },
  "watchHistory": [
    { "title": "Kurukshetra: 'Krishn'", "date": "25/10/25" },
    { "title": "Kurukshetra: 'Stree Parv'", "date": "25/10/25" }
  ],
  "totalTitlesWatched": 75
}`;

// Define the structure for our agent statuses
type AgentStatus = {
  agentId: string;
  agentName: string;
  status: "pending" | "generating" | "completed" | "error";
  data?: any;
  error?: string;
};

// Define the initial state for the agents
const INITIAL_AGENTS: Record<string, AgentStatus> = {
  persona_analyst: {
    agentId: "persona_analyst",
    agentName: "Persona Analyst",
    status: "pending",
  },
  recommendation_engine: {
    agentId: "recommendation_engine",
    agentName: "Recommendation Engine",
    status: "pending",
  },
  marketing_strategist: {
    agentId: "marketing_strategist",
    agentName: "Marketing Strategist",
    status: "pending",
  },
};

export default function DataAgentPage() {
  const [jsonData, setJsonData] = useState<string>(placeholderNetflixData);
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>(INITIAL_AGENTS);
  const [error, setError] = useState<string | null>(null);

  // Helper to render agent status icons
  const StatusIcon = ({ status }: { status: AgentStatus["status"] }) => {
    if (status === "generating") {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (status === "completed") {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === "error") {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <Cpu className="w-4 h-4 text-muted-foreground/50" />;
  };

  // Handle the generation process
  const handleGenerate = async () => {
    setIsLoading(true);
    setAgentStatuses(INITIAL_AGENTS); // Reset all statuses
    setError(null);

    try {
      // 1. Validate JSON input
      JSON.parse(jsonData); 
    } catch (err) {
      setError("Invalid JSON format. Please check your data.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/generate-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawData: jsonData }),
      });

      if (!response.body) {
        throw new Error("Response body is missing.");
      }

      // 2. Read the stream
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split("\n"); // Each update is a new line

        // Process all complete lines, keep the last partial line in buffer
        buffer = lines.pop() || ""; 

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            const update = JSON.parse(line) as AgentStatus;

            // 3. Update the UI state for the specific agent
            setAgentStatuses(prev => ({
              ...prev,
              [update.agentId]: {
                ...prev[update.agentId], // Keep old data
                ...update, // Overwrite with new status/data
              },
            }));
          } catch (e) {
            console.warn("Failed to parse stream chunk:", line);
          }
        }
      }

    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Error generating synthetic data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Agent Studio</h1>
          <p className="text-muted-foreground">
            Generate synthetic data profiles using a real-time multi-LLM agent.
          </p>
        </div>
      </div>

      {/* Agent Input/Output Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Input Card */}
        <Card className="p-6 border-border/40">
          <h2 className="text-lg font-semibold mb-2">1. Paste Raw Data</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Paste your verified Netflix JSON data below.
          </p>

          <Textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Paste your JSON data here..."
            className="w-full h-80 font-mono text-xs"
          />
          
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 mt-4 w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isLoading ? "Agents Running..." : "Run Agents"}
          </Button>

          {error && (
            <p className="text-sm mt-4 text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </Card>

        {/* Output Card */}
        <Card className="p-6 border-border/40">
          <h2 className="text-lg font-semibold mb-2">2. Agent Status & Output</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Outputs will appear below in real-time as they are generated.
          </p>
          
          <div className="space-y-4">
            {Object.values(agentStatuses).map((agent) => (
              <div key={agent.agentId} className="border border-border/40 rounded-md">
                {/* Agent Header */}
                <div className="flex items-center gap-3 p-3 bg-card/50 border-b border-border/40">
                  <StatusIcon status={agent.status} />
                  <div>
                    <h3 className="font-semibold">{agent.agentName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {agent.status === 'pending' && 'Waiting...'}
                      {agent.status === 'generating' && `Generating... (Model: ${agent.agentName.split('(')[1]}`}
                      {agent.status === 'completed' && 'Completed'}
                      {agent.status === 'error' && `Error: ${agent.error}`}
                    </p>
                  </div>
                </div>
                
                {/* Agent Data Output */}
                {agent.data && (
                  <div className="w-full bg-gray-900/50 rounded-b-md overflow-auto p-4">
                    <pre className="text-xs text-white">
                      {JSON.stringify(agent.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}