"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHousehold } from "./actions/household";

export default function HouseHoldForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createHousehold({ name });

      if (result?.success) {
        router.push("/dashboard");
      } else {
        setError(result?.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="name">Household Name</Label>
        <Input
          id="name"
          placeholder="e.g. My Apartment"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Household"}
      </Button>
    </div>
  );
}
