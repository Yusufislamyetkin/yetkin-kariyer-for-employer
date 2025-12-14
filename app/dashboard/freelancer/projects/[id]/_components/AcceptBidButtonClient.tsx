"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { CheckCircle, XCircle } from "lucide-react";

export default function AcceptBidButtonClient({
  projectId,
  bidId,
}: {
  projectId: string;
  bidId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!confirm("Bu teklifi kabul etmek istediğinize emin misiniz? Diğer tüm teklifler reddedilecektir.")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/freelancer/projects/${projectId}/bids/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error accepting bid:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/freelancer/projects/${projectId}/bids/${bidId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error rejecting bid:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleAccept}
        isLoading={loading}
      >
        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
        Kabul Et
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReject}
        isLoading={loading}
      >
        <XCircle className="h-4 w-4 mr-2 text-red-600" />
        Reddet
      </Button>
    </div>
  );
}
