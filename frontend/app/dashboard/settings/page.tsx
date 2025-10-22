"use client";
import React, { useState, useEffect } from "react";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";

export default function SettingsPage() {
  const [reclaimProofRequest, setReclaimProofRequest] = useState<any>(null);
  const [requestUrl, setRequestUrl] = useState("");
  const [statusUrl, setStatusUrl] = useState("");
  const [proofs, setProofs] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function initializeReclaim() {
      try {
        const APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APP_ID!;
        const APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET!;
        const PROVIDER_ID = process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_ID!; // Kaggle provider ID

        const proofRequest = await ReclaimProofRequest.init(
          APP_ID,
          APP_SECRET,
          PROVIDER_ID
        );

        setReclaimProofRequest(proofRequest);
        console.log("✅ Reclaim initialized successfully");
      } catch (err) {
        console.error("Error initializing Reclaim:", err);
      }
    }

    initializeReclaim();
  }, []);

  // Create a new verification claim
  async function handleCreateClaim() {
    if (!reclaimProofRequest) {
      alert("Reclaim not initialized yet.");
      return;
    }

    const url = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(url);

    const status = reclaimProofRequest.getStatusUrl();
    setStatusUrl(status);

    console.log("Scan this QR code to verify Kaggle account.");

    await reclaimProofRequest.startSession({
      onSuccess: (proofs: any) => {
        console.log("✅ Proof received:", proofs);
        setProofs(proofs);
        alert("Verification successful! Proof generated.");
      },
      onFailure: (error: any) => {
        console.error("Verification failed:", error);
        alert("Verification failed. Try again.");
      },
    });
  }

  // Upload proof to Lighthouse for storage
  async function handleUploadProof() {
    if (!proofs) {
      alert("No proof found.");
      return;
    }

    try {
      setUploading(true);
      const response = await fetch("/api/agent/uploadProof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof: proofs,
          meta: { source: "Kaggle", verified: true },
        }),
      });

      const data = await response.json();
      if (data.cid) {
        alert(`✅ Uploaded dataset to Lighthouse. CID: ${data.cid}`);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading proof:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Kaggle Verification (Reclaim Protocol)</h1>
      <p className="text-muted-foreground mb-6">
        Verify your Kaggle account using zkTLS proof via Reclaim Protocol.
      </p>

      <button
        onClick={handleCreateClaim}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        Generate Kaggle Proof
      </button>

      {requestUrl && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Scan this QR Code using Reclaim App:</h2>
          <QRCode value={requestUrl} />
          <p className="text-sm mt-2 text-muted-foreground">
            Or open directly: <a href={requestUrl} target="_blank" className="text-blue-500 underline">{requestUrl}</a>
          </p>
        </div>
      )}

      {proofs && (
        <div className="mt-6 bg-muted p-4 rounded-lg">
          <h2 className="font-semibold mb-2">✅ Proof Generated Successfully</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(proofs, null, 2)}
          </pre>

          <button
            onClick={handleUploadProof}
            disabled={uploading}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {uploading ? "Uploading..." : "Upload Proof to Lighthouse"}
          </button>
        </div>
      )}
    </div>
  );
}
