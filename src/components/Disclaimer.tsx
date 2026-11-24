export default function Disclaimer({ text }: { text?: string }) {
  const defaultText = 'This information is for educational purposes only and does not constitute financial advice. Deal scores, ROI estimates, and property valuations are indicative and based on publicly available data. Always conduct independent due diligence before making any investment decision. InvestNest is not a financial advisor or broker.';
  
  return (
    <div className="text-[11px] text-slate-400 leading-relaxed mt-8 pt-4 border-t border-slate-200/60">
      <span className="font-medium text-slate-500">Disclaimer:</span> {text || defaultText}
    </div>
  );
}