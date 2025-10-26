"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Cpu,
  CheckCircle,
  UploadCloud,
  RefreshCw,
  FileText,
  Check,
} from "lucide-react";
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

// Define structure for uploaded files from Lighthouse
type UploadedFile = {
  cid: string;
  fileName: string;
};

export default function DataAgentPage() {
  const [jsonData, setJsonData] = useState<string>(placeholderNetflixData);
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatuses, setAgentStatuses] =
    useState<Record<string, AgentStatus>>(INITIAL_AGENTS);
  const [error, setError] = useState<string | null>(null);

  // --- New Lighthouse & Data States ---
  const [combinedAgentData, setCombinedAgentData] = useState<any | null>(null);
  const [isLighthouseUploading, setIsLighthouseUploading] = useState(false);
  const [lighthouseError, setLighthouseError] = useState<string | null>(null);
  const [uploadSuccessCid, setUploadSuccessCid] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // ------------------------------------

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

  // --- MODIFIED Function: Fetch Uploaded Files ---
  const fetchUploadedFiles = useCallback(async () => {
    setLighthouseError(null);
    try {
      const response = await fetch("/api/lighthouseUpload");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch files.");
      }
      const files: UploadedFile[] = await response.json();

      // --- FIX: De-duplicate the list on the UI side ---
      // Use a Map to ensure each CID is unique.
      const fileMap = new Map(
        files.map((f: UploadedFile) => [
          f.cid, // The key (will be unique)
          f      // The value
        ])
      );
      // Convert the Map's values back into an array
      const uniqueFiles = Array.from(fileMap.values());
      // ---------------------------------------------
      
      setUploadedFiles(uniqueFiles); // Set the de-duplicated list
    } catch (err: any) {
      setLighthouseError(`Failed to fetch file list: ${err.message}`);
    }
  }, []); // No dependencies needed for useCallback

  // --- New Effect: Fetch files on mount ---
  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

  // --- New Effect: Combine data after agents finish ---
  useEffect(() => {
    // Don't run this logic while agents are actively running
    if (isLoading) {
      return;
    }

    const allAgents = Object.values(agentStatuses);
    // Check if any agent has a status other than "pending" (i.e., a run was attempted)
    const anyAgentRan = allAgents.some((a) => a.status !== "pending");

    if (!anyAgentRan) {
      setCombinedAgentData(null);
      return;
    }

    const allComplete = allAgents.every((a) => a.status === "completed");

    if (allComplete) {
      // Combine all agent data into a single object, keyed by agentId
      const combinedData = allAgents.reduce((acc, agent) => {
        acc[agent.agentId] = agent.data;
        return acc;
      }, {} as Record<string, any>);
      setCombinedAgentData(combinedData);
    } else {
      // If any agent failed or is not complete, reset
      setCombinedAgentData(null);
    }
  }, [agentStatuses, isLoading]); // Re-run when statuses change or loading stops

  // Handle the agent generation process
  const handleGenerate = async () => {
    setIsLoading(true);
    setAgentStatuses(INITIAL_AGENTS); // Reset all statuses
    setError(null);
    // --- Reset Lighthouse/Combined data states ---
    setCombinedAgentData(null);
    setLighthouseError(null);
    setUploadSuccessCid(null);
    // ------------------------------------------

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
        buffer = lines.pop() || ""; // Keep partial line

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            const update = JSON.parse(line) as AgentStatus;
            // 3. Update the UI state for the specific agent
            setAgentStatuses((prev) => ({
              ...prev,
              [update.agentId]: {
                ...prev[update.agentId],
                ...update,
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

  // --- New Function: Handle Lighthouse Upload ---
  const handleLighthouseUpload = async () => {
    if (!combinedAgentData) return;

    setIsLighthouseUploading(true);
    setLighthouseError(null);
    setUploadSuccessCid(null);

    try {
      const response = await fetch("/api/lighthouseUpload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicData: combinedAgentData }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Upload failed.");
      }

      const result = await response.json();
      setUploadSuccessCid(result.cid); // Show success!
      fetchUploadedFiles(); // Refresh the list of files
    } catch (err: any) {
      setLighthouseError(err.message);
    } finally {
      setIsLighthouseUploading(false);
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
                      {agent.status === "pending" && "Waiting..."}
                      {agent.status === "generating" && `Generating...`}
                      {agent.status === "completed" && "Completed"}
                      {agent.status === "error" && `Error: ${agent.error}`}
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

          {/* --- New Lighthouse Upload Section --- */}
          {combinedAgentData && !isLoading && (
            <div className="mt-6 border-t border-border/40 pt-6">
              <h3 className="text-md font-semibold mb-3">
                3. Upload Agent Output
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                All agents completed successfully. You can now upload the combined
                output to Lighthouse.
              </p>
              <Button
                onClick={handleLighthouseUpload}
                disabled={isLighthouseUploading}
                className="w-full flex items-center gap-2"
              >
                {isLighthouseUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                {isLighthouseUploading ? "Uploading..." : "Upload to Lighthouse"}
              </Button>

              {/* Lighthouse Error Message */}
              {lighthouseError && !uploadSuccessCid && (
                <p className="text-sm mt-4 text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {lighthouseError}
                </p>
              )}

              {/* Lighthouse Success Message */}
              {uploadSuccessCid && (
                <p className="text-sm mt-4 text-green-500 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Upload successful! CID:{" "}
                  <a
                    href={`https://gateway.lighthouse.storage/ipfs/${uploadSuccessCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline truncate"
                  >
                    {uploadSuccessCid}
                  </a>
                </p>
              )}
            </div>
          )}
          {/* ------------------------------------- */}
        </Card>
      </div>

      {/* --- New Uploaded Files Card --- */}
      <Card className="p-6 border-border/40 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              Uploaded Files (Lighthouse)
            </h2>
            <p className="text-muted-foreground text-sm">
              Previously uploaded agent outputs.
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchUploadedFiles}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {uploadedFiles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {lighthouseError
                ? "Could not load files."
                : "No files found."}
            </p>
          )}
          {uploadedFiles.map((file) => (
            <div
              key={file.cid} // This will now be unique
              className="flex items-center justify-between p-3 border border-border/40 rounded-md bg-card/50"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="overflow-hidden">
                  <p
                    className="text-sm font-medium truncate"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </p>
                  <p
                    className="text-xs text-muted-foreground truncate"
                    title={file.cid}
                  >
                    CID: {file.cid}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm">
                <a
                  href={`https://gateway.lighthouse.storage/ipfs/${file.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </Button>
            </div>
          ))}
        </div>
      </Card>
      {/* ------------------------------- */}
    </div>
  );
}