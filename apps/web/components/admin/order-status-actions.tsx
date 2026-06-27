"use client";

import { useState } from "react";

type OrderStatusActionsProps = {
  orderId: string;
  currentStatus: string;
};

const statusOptions = [
  { status: "paid", label: "Mark paid" },
  { status: "preparing", label: "Start preparing" },
  { status: "ready", label: "Mark ready" },
  { status: "cancel_requested", label: "Request cancel" }
] as const;

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableActions = statusOptions.filter((option) => {
    if (option.status === "paid") {
      return status !== "paid" && status !== "cancelled" && status !== "cancel_requested";
    }
    if (option.status === "preparing") {
      return status !== "preparing" && status !== "ready" && status !== "served" && status !== "completed" && status !== "cancelled";
    }
    if (option.status === "ready") {
      return status !== "ready" && status !== "served" && status !== "completed" && status !== "cancelled";
    }
    if (option.status === "cancel_requested") {
      return status !== "cancel_requested" && status !== "cancelled" && status !== "completed";
    }
    return false;
  });

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        setError(payload?.error?.message ?? "Unable to update order status.");
        return;
      }

      setStatus(payload.data.status ?? newStatus);
    } catch (err) {
      setError("Unable to update order status.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap gap-2">
        {availableActions.map((action) => (
          <button
            key={action.status}
            type="button"
            className="secondary-button text-sm"
            disabled={loading}
            onClick={() => void updateStatus(action.status)}
          >
            {action.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <p className="text-xs text-white/50">Current status: {status}</p>
    </div>
  );
}
