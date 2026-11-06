"use client";
import { useState, useEffect } from "react";
import { Phone, Send } from "lucide-react";
import { Clock, CheckCircle2 } from "lucide-react";


export default function BookingForm({ presetMachine = "" }: { presetMachine?: string }) {
  const [kind, setKind] = useState("booking");
  const [machine, setMachine] = useState(presetMachine);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const expiry = Number(sessionStorage.getItem("enquiry-submitted-until"));

    if (expiry && Date.now() < expiry) {
      setSubmitted(true);
      setExpiresAt(expiry);
    } else if (expiry) {
      sessionStorage.removeItem("enquiry-submitted-until");
    }
  }, []);

  useEffect(() => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      const remaining = expiresAt - Date.now();

      if (remaining <= 0) {
        sessionStorage.removeItem("enquiry-submitted-until");
        setSubmitted(false);
        setExpiresAt(null);
        setRemainingMs(0);
        setSuccess("");
        return;
      }

      setRemainingMs(remaining);
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    if (submitted) return;
    e.preventDefault();

    if (kind === "booking" && (!machine || !start || !end || !location)) {
      setError("Please complete the machine, dates and work location fields.");
      return;
    }

    if (kind === "booking" && end < start) {
      setError("End date must be on or after the start date.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind,
          name,
          phone,
          machine,
          start,
          end,
          location,
          details,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit enquiry.");
      }

      setSuccess("Your enquiry has been submitted successfully. We will contact you shortly.");

      const expiry = Date.now() + 24 * 60 * 60 * 1000;

      sessionStorage.setItem("enquiry-submitted-until", expiry.toString());

      setExpiresAt(expiry);
      setSubmitted(true);

      // Reset form fields after successful submission.
      setName("");
      setPhone("");
      setMachine("");
      setStart("");
      setEnd("");
      setLocation("");
      setDetails("");

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    submitted ? (
      <div
        id="booking-form"
        className="border border-[#e2e8ec] bg-white p-7 md:p-10"
      >
        <div className="flex flex-col items-center py-6 text-center">

          {/* Success Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 size={42} className="text-green-600" />
          </div>

          {/* Thank You Message */}
          <p className="eyebrow text-green-700">
            Enquiry Successfully Received
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-[#182b3a]">
            Thank You!
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-[#637381]">
            We have successfully received your enquiry. Our team will
            review your request and contact you shortly to discuss
            availability and rental arrangements.
          </p>

          {/* Important Notice */}
          <div className="mt-8 w-full max-w-md border border-green-100 bg-green-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0 text-green-700"
              />
              <div>
                <p className="text-sm font-bold text-[#245c3b]">
                  Your submission is complete
                </p>
                <p className="mt-1 text-xs leading-6 text-[#537460]">
                  You do not need to submit this form again.
                  We have received your details by email.
                </p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="mt-9 w-full max-w-md">
            <div className="flex items-center justify-center gap-2">
              <Clock size={17} className="text-[#805600]" />
              <p className="text-sm font-bold text-[#182b3a]">
                Next enquiry available in
              </p>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { label: "Days", value: days },
                { label: "Hours", value: hours },
                { label: "Minutes", value: minutes },
                { label: "Seconds", value: seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-[#e2e8ec] bg-[#f8fafb] px-2 py-4"
                >
                  <p className="text-2xl font-extrabold tabular-nums text-[#182b3a] sm:text-3xl">
                    {String(item.value).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#71808a]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-[#71808a]">
              You can submit another enquiry once this timer expires.
            </p>
          </div>

          {/* Direct Contact */}
          <div className="mt-9 w-full border-t border-[#e8ecef] pt-7">
            <p className="text-sm font-semibold text-[#637381]">
              Need immediate assistance?
            </p>

            <a
              href="tel:9702803911"
              className="mt-4 inline-flex items-center justify-center gap-3 bg-[#182b3a] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#29475b]"
            >
              <Phone size={17} />
              Call us: 9702803911
            </a>
          </div>

        </div>
      </div>
    ) : (
      <form
        id="booking-form"
        onSubmit={submit}
        className="border border-[#e2e8ec] bg-white p-6 md:p-9"
      >
        <div className="mb-7 border-b border-[#e8ecef] pb-6">
          <p id="enquiry-heading" className="eyebrow">
            Send an enquiry
          </p>

          <h2 className="mt-2 text-2xl font-extrabold">
            Tell us about your project
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#637381]">
            Submit your details and our team will receive your enquiry
            directly by email. We will contact you to confirm availability
            and rental terms.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="name">Full name *</label><input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
          <div><label htmlFor="phone">Contact number *</label><input id="phone" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="98XXXXXXXX" inputMode="tel" /></div>
        </div>
        <div className="mt-5"><label>What would you like to do? *</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setKind("booking")} className={`cursor-pointer border px-4 py-3 text-sm font-bold ${kind === "booking" ? "border-[#805600] bg-[#fff9eb]" : "border-[#d7dfe4]"}`}>Book a machine</button>
            <button type="button" onClick={() => setKind("contact")} className={`cursor-pointer border px-4 py-3 text-sm font-bold ${kind === "contact" ? "border-[#805600] bg-[#fff9eb]" : "border-[#d7dfe4]"}`}>General contact</button>
          </div>
        </div>
        {kind === "booking" ? <>
          <div className="mt-5"><label htmlFor="machine">Machine required *</label><select id="machine" required value={machine} onChange={e => setMachine(e.target.value)}><option value="">Select a machine</option><option>Grader</option><option>Road Roller</option><option>Excavator</option></select></div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="start">Rental start date *</label><input id="start" type="date" required value={start} min={new Date().toISOString().slice(0, 10)} onChange={e => setStart(e.target.value)} /></div>
            <div><label htmlFor="end">Rental end date *</label><input id="end" type="date" required min={start || new Date().toISOString().slice(0, 10)} value={end} onChange={e => setEnd(e.target.value)} /></div>
          </div>
          <div className="mt-5"><label htmlFor="location">Project / work location *</label><input id="location" required value={location} onChange={e => setLocation(e.target.value)} placeholder="Village, municipality, district or site address" /></div>
          <div className="mt-5"><label htmlFor="details">Additional details (optional)</label><textarea id="details" rows={4} value={details} onChange={e => setDetails(e.target.value)} placeholder="Project type, expected working hours, site access, operator requirements or anything else..." /></div>
        </> : <div className="mt-5"><label htmlFor="details">How can we help? *</label><textarea id="details" required rows={6} value={details} onChange={e => setDetails(e.target.value)} placeholder="Write your question or enquiry here..." /></div>}

        {/* Error Message */}
        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary mt-7 w-full sm:w-auto"
        >
          <Send size={16} />
          {kind === "booking" ? "Confirm booking" : "Send enquiry"}
        </button>

        <p className="mt-4 flex items-center gap-2 text-xs text-[#71808a]">
          <Phone size={14} />
          Prefer to speak directly? Call
          <a
            className="font-bold text-[#182b3a]"
            href="tel:9702803911"
          >
            9702803911
          </a>.
        </p>
      </form>
    )
  );

}
