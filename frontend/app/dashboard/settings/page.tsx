"use client";
import React, { useState, useEffect } from "react";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Upload, FileText, Loader2, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [reclaimProofRequest, setReclaimProofRequest] = useState<any>(null);
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [cid, setCid] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUploadsModal, setShowUploadsModal] = useState(false);

  useEffect(() => {
    async function initReclaim() {
      try {
        const APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APP_ID!;
        const APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET!;
        const PROVIDER_ID = process.env.NEXT_PUBLIC_RECLAIM_PROVIDER_ID!;

        const proofRequest = await ReclaimProofRequest.init(
          APP_ID,
          APP_SECRET,
          PROVIDER_ID
        );
        setReclaimProofRequest(proofRequest);
      } catch (err) {
        console.error("Reclaim init failed:", err);
      }
    }
    initReclaim();
  }, []);

  async function handleCreateClaim() {
    if (!reclaimProofRequest) {
      setErrorMessage("Reclaim not initialized. Please refresh the page.");
      setShowFailModal(true);
      return;
    }

    const url = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(url);
    setShowQRModal(true);

    await reclaimProofRequest.startSession({
      onSuccess: (proofs: any) => {
        setProofs(proofs);
        setShowQRModal(false);
        setShowSuccessModal(true);
      },
      onFailure: (err: any) => {
        setShowQRModal(false);
        setErrorMessage(err?.message || "Verification failed. Please try again.");
        setShowFailModal(true);
      },
    });
  }

  async function handleUploadToLighthouse() {
    if (!proofs) {
      setErrorMessage("No proof available to upload.");
      setShowFailModal(true);
      return;
    }

    try {
      setUploading(true);
      const res = await fetch("/api/lighthouseUpload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proofs),
      });

      const data = await res.json();
      if (data.cid) {
        setCid(data.cid);
      } else {
        setErrorMessage("Upload failed. Please try again.");
        setShowFailModal(true);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setErrorMessage("Upload failed due to network error.");
      setShowFailModal(true);
    } finally {
      setUploading(false);
    }
  }

  const fetchUploads = async () => {
    try {
      const res = await fetch("/api/lighthouseUpload");
      const data = await res.json();
      const cids = data.map((file: any) => file.cid);
      setUploads(cids);
      setShowUploadsModal(true);
    } catch (err) {
      console.error("Error fetching uploads:", err);
      setErrorMessage("Failed to fetch uploads. Please try again.");
      setShowFailModal(true);
    }
  };

  // Calculate statistics from Netflix data
const getNetflixStats = () => {
  if (!proofs?.publicData?.watchHistory) return null;

  const publicData = proofs.publicData;
  const watchHistory = publicData.watchHistory;
  
  return {
    // Basic watch history stats
    totalShows: watchHistory.length || 0,
    totalHours: watchHistory.reduce((acc: number, item: any) => {
      const duration = item.duration || item.watchDuration || 0;
      return acc + (duration / 3600); // Convert seconds to hours
    }, 0).toFixed(1),
    
    // Extract unique genres (if available in items)
    genres: [...new Set(watchHistory.map((item: any) => item.genre).filter(Boolean))],
    
    // Recent watch history with ALL fields preserved
    recentlyWatched: watchHistory.slice(0, 5).map((item: any) => ({
      title: item.title,
      titleId: item.titleId, // Critical: Netflix title identifier
      date: item.date, // Critical: Watch date
      duration: item.duration || item.watchDuration,
      genre: item.genre,
      // Preserve any other fields that might exist
      ...item
    })),
    
    // Full watch history with all fields
    fullWatchHistory: watchHistory.map((item: any) => ({
      title: item.title,
      titleId: item.titleId,
      date: item.date,
      ...item
    })),
    
    // Critical: Membership details
    membershipDetails: publicData.membershipDetails ? {
      planType: publicData.membershipDetails.planType,
      planDescription: publicData.membershipDetails.planDescription,
      paymentMethod: publicData.membershipDetails.paymentMethod,
      paymentDescription: publicData.membershipDetails.paymentDescription,
    } : null,
    
    // Critical: Aggregate statistics from proof
    totalTitlesWatched: publicData.totalTitlesWatched || watchHistory.length,
    totalLiked: publicData.totalLiked || 0,
    totalDisliked: publicData.totalDisliked || 0,
    
    // Critical: Ratings data
    ratings: publicData.ratings || [],
    
    // Optional: Extract unique dates for timeline analysis
    watchDates: [...new Set(watchHistory.map((item: any) => item.date).filter(Boolean))],
    
    // Optional: Title IDs for potential lookups
    titleIds: watchHistory.map((item: any) => item.titleId).filter(Boolean),
  };
};

  const stats = getNetflixStats();

  return (
    <div className="min-h-screen  p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
           Connect Your Phone to Upload Netflix Data
          </h1>
          <p className="text-slate-300 text-lg">
            Securely verify and store your Netflix watch history on IPFS
          </p>
        </div>

        {/* Main Action Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Start Verification</CardTitle>
            <CardDescription className="text-slate-300">
              Generate a proof of your Netflix data using Reclaim Protocol
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!proofs ? (
              <Button
                onClick={handleCreateClaim}
                size="lg"
                className="w-full bg-gradient-to-r  hover:to-pink-700 text-white font-semibold"
              >
                <Upload className="mr-2 h-5 w-5" />
                Generate Verification Proof
              </Button>
            ) : (
              <Alert className="bg-green-900/20 border-green-700 text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Verification successful! Your Netflix data has been verified.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Verified Data Display */}
        {proofs && stats && (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Verified Netflix Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="text-slate-400 text-sm">Total Shows/Movies</div>
                  <div className="text-3xl font-bold text-white mt-1">{stats.totalShows}</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="text-slate-400 text-sm">Total Watch Hours</div>
                  <div className="text-3xl font-bold text-white mt-1">{stats.totalHours}h</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="text-slate-400 text-sm">Genres</div>
                  <div className="text-3xl font-bold text-white mt-1">{stats.genres.length}</div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Raw Data */}
              <div>
                <h3 className="text-white font-semibold mb-3">Complete Watch History</h3>
                <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 max-h-96 overflow-auto">
                  <pre className="text-green-400 text-xs font-mono">
                    {JSON.stringify(proofs, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Upload Section */}
              <div className="space-y-3">
                <Button
                  onClick={handleUploadToLighthouse}
                  disabled={uploading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading to IPFS...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload to Lighthouse Storage
                    </>
                  )}
                </Button>

                {cid && (
                  <Alert className="bg-blue-900/20 border-blue-700">
                    <FileText className="h-4 w-4" />
                    <AlertDescription className="text-blue-100">
                      <div className="font-semibold mb-2">Successfully stored on IPFS!</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">CID:</span>
                        <a
                          href={`https://gateway.lighthouse.storage/ipfs/${cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline text-sm flex items-center gap-1 break-all"
                        >
                          {cid}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Uploaded Documents */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <Button
              onClick={fetchUploads}
              variant="outline"
              size="lg"
              className="w-full border-slate-600 text-white hover:bg-slate-700"
            >
              <FileText className="mr-2 h-5 w-5" />
              My Uploaded Documents
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription className="text-slate-300">
                Open the Reclaim app and scan this QR code to verify your Netflix data
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              {requestUrl && (
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={requestUrl} size={200} />
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for verification...
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                Verification Successful!
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Your Netflix data has been successfully verified and is ready to upload.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowSuccessModal(false)}>
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Failure Modal */}
        <Dialog open={showFailModal} onOpenChange={setShowFailModal}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <XCircle className="h-6 w-6" />
                Verification Failed
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowFailModal(false)} variant="outline" className="border-slate-600">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Uploads Modal */}
        <Dialog open={showUploadsModal} onOpenChange={setShowUploadsModal}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>My Uploaded Documents</DialogTitle>
              <DialogDescription className="text-slate-300">
                All your previously uploaded Netflix verification proofs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-auto">
              {uploads.length > 0 ? (
                uploads.map((cid, index) => (
                  <div
                    key={cid}
                    className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white mb-1">
                            Upload #{index + 1}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{cid}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 flex-shrink-0"
                        asChild
                      >
                        <a
                          href={`https://gateway.lighthouse.storage/ipfs/${cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No uploads found
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}