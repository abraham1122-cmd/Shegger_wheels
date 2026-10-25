import Link from "next/link";
import DisputeForm from "@/components/disputes/dispute-form";

export default function NewDisputePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/disputes"
        className="text-sm font-medium text-blue-600"
      >
        ← Back to Disputes
      </Link>

      <h1 className="mt-5 text-3xl font-bold">Create a Dispute</h1>

      <p className="mb-6 mt-2 text-gray-600">
        Explain your rental issue. You can track the status after submitting.
      </p>

      <DisputeForm />
    </main>
  );
}