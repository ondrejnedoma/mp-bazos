"use client";

import clsx from "clsx";
import React, { useEffect, useState } from "react";

export default function JobButton({ className, endpoint, buttonText }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pollOnce = async () => {
    const statusResponse = await fetch(`/api/job-status?jobId=${endpoint}`);
    const statusData = await statusResponse.json();
    if (statusData.status === "idle") {
      setLoading(false);
      return false;
    } else if (statusData.status === "error") {
      setLoading(false);
      setError(statusData.error || "An error occurred");
      return false;
    }
    return true;
  };

  const pollSchedule = async () => {
    const maxAttempts = 500;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const isRunning = await pollOnce();
      if (!isRunning) {
        break;
      }
      attempts++;
    }
  };

  const onClick = async () => {
    const response = await fetch(`/api/${endpoint}`, {
      method: "POST",
    });
    const data = await response.json();
    if (response.status === 200) {
      pollSchedule();
      setLoading(true);
      setError(null);
    } else {
      setLoading(false);
      setError(data.message || "Failed to start job");
    }
  };

  useEffect(() => {
    pollOnce();
  }, []);

  return (
    <button
      className={clsx(
        !loading && !error && className,
        "rounded-lg p-4 text-center font-semibold transition-colors w-full",
        loading ? "bg-gray-600 cursor-not-allowed" : `cursor-pointer`,
        error && "bg-red-500 hover:bg-red-600",
      )}
      onClick={onClick}
      disabled={loading}
    >
      {error ? error : buttonText}
    </button>
  );
}
