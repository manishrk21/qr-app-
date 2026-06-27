"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";

type CustomerEntryProps = {
  restaurantSlug: string;
  restaurantName: string;
  restaurantCity: string | null;
  tableLabel?: string | null;
  tableCapacity?: number | null;
  tableId?: string;
};

export function CustomerEntry({
  restaurantSlug,
  restaurantName,
  restaurantCity,
  tableLabel,
  tableCapacity,
  tableId
}: CustomerEntryProps) {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"entry" | "otp">("entry");
  const [status, setStatus] = useState("Scan the QR or continue with your mobile number.");

  const detectedTable = useMemo(
    () =>
      tableId
        ? {
            id: tableId,
            label: tableLabel ?? "Table detected from QR",
            capacity: tableCapacity ?? null
          }
        : null,
    [tableCapacity, tableId, tableLabel]
  );

  useEffect(() => {
    if (tableId) {
      setStatus(
        `Table ${detectedTable?.label ?? tableId} detected from the QR code.`
      );
    }
  }, [detectedTable, tableId]);

  const nextHref = `/r/${restaurantSlug}/menu${
    tableId ? `?table=${tableId}` : ""
  }`;

  const requestOtp = () => {
    if (phone.trim().length < 8) {
      setStatus("Please enter a valid mobile number.");
      return;
    }

    void (async () => {
      setStatus("Sending OTP...");
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantSlug,
          mobileNumber: phone,
          tableId
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setStatus(payload?.error?.message ?? "Unable to send OTP.");
        return;
      }

      setStep("otp");
      setStatus(
        payload.data.demoOtp
          ? `OTP sent. Demo code ${payload.data.demoOtp} is available in development.`
          : "OTP sent. Check your phone to continue."
      );
    })();
  };

  const verifyOtp = () => {
    void (async () => {
      setStatus("Verifying OTP...");
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantSlug,
          mobileNumber: phone,
          otp,
          tableId
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setStatus(payload?.error?.message ?? "Unable to verify OTP.");
        return;
      }

      setSession({
        customerSessionToken: payload.data.customerSessionToken,
        restaurantSlug,
        customerId: payload.data.customer?.id ?? null,
        tableId: payload.data.tableId ?? tableId ?? null
      });
      setStatus("Session verified. Opening the menu.");
      router.push(nextHref);
    })();
  };

  return (
    <main className="section-shell py-14">
      <section className="glass-panel rounded-[2rem] p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
              QR entry
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">
              Welcome to {restaurantName}
            </h2>
            <p className="section-subcopy">
              This is the customer gate for the QR journey. It keeps the table
              context intact and unlocks the menu after OTP verification.
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                Status
              </p>
              <p className="mt-2">{status}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70" htmlFor="customer-phone">
                  Mobile number
                </label>
                <input
                  id="customer-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                />
              </div>
              <div>
                <label className="text-sm text-white/70" htmlFor="customer-otp">
                  OTP
                </label>
                <input
                  id="customer-otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {step === "entry" ? (
                <>
                  <button className="primary-button" type="button" onClick={requestOtp}>
                    Send OTP
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={async () => {
                      setStatus("Starting guest session...");
                      const response = await fetch("/api/auth/guest/login", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ restaurantSlug, tableId })
                      });
                      const payload = await response.json().catch(() => null);
                      if (!response.ok || !payload?.ok) {
                        setStatus(payload?.error?.message ?? "Unable to start guest session.");
                        return;
                      }

                      setSession({
                        customerSessionToken: payload.data.sessionToken,
                        restaurantSlug,
                        customerId: payload.data.customerId,
                        tableId: tableId ?? null
                      });
                      setStatus("Guest session created. Opening the menu.");
                      router.push(nextHref);
                    }}
                  >
                    Continue as guest
                  </button>
                </>
              ) : (
                <button className="primary-button" type="button" onClick={verifyOtp}>
                  Verify and continue
                </button>
              )}
              <button
                className="secondary-button"
                type="button"
                onClick={() => router.push(nextHref)}
              >
                Skip to menu
              </button>
            </div>

            <p className="mt-5 text-xs text-white/45">
              Demo note: use OTP <span className="text-white/70">123456</span> to
              unlock the flow while backend verification is still being wired.
            </p>
          </div>

          <aside className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">
              QR context
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Restaurant
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {restaurantName}
                </p>
                <p className="mt-1 text-sm text-white/55">{restaurantCity ?? "City not configured"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Table
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {detectedTable?.label ?? "Table not detected"}
                </p>
                <p className="mt-1 text-sm text-white/55">
                  {detectedTable?.capacity
                    ? `Seats ${detectedTable.capacity}`
                    : "Use the QR table token"}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Flow
                </p>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  QR scan routes to this entry gate, OTP verifies the guest, and
                  the customer can then browse the menu and place an order.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
