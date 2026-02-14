export default function SafetyNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Safety tip</p>
      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
        Do not share OTPs, bank details, or passwords. Meet at a public campus spot and verify item details before handover.
      </p>
    </div>
  );
}
