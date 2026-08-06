"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TelemetryPanel } from "@/components/ui/TelemetryPanel";

export default function IMessageSimulator() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [faceIdActive, setFaceIdActive] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleReview = () => {
    setSheetOpen(true);
  };

  const handleApprove = () => {
    setSheetOpen(false);
    setFaceIdActive(true);

    setTimeout(() => {
      setFaceIdActive(false);
      setApproved(true);
      
      setTimeout(() => {
        router.push("/demo/prava");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-surface-card text-xs uppercase p-8">
      <Link href="/demo/prava" className="absolute top-8 left-8 text-text-neutral hover:text-white border border-text-neutral/20 px-4 py-2 bg-surface-base">
        [ SKIP_TO_PRAVA ]
      </Link>

      <div className="relative w-[375px] h-[812px] bg-black border border-text-neutral/20 overflow-hidden">
        {/* Header intercept */}
        <div className="h-16 border-b border-text-neutral/20 bg-surface-card flex items-center justify-center relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-critical"></div>
          <div className="text-text-primary tracking-widest font-bold">{"/// INTERCEPT.VAPOR"}</div>
          <div className="absolute top-4 right-4 text-[10px] text-text-neutral/60 animate-pulse">REC_LIVE</div>
        </div>

        {/* Chat Area */}
        <div className="p-6 h-[calc(100%-64px)] bg-surface-card flex flex-col gap-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMzMzMiLz48L3N2Zz4=')]">
          
          <div className="w-4/5 bg-surface-base border border-text-neutral/20 text-text-neutral p-3 shadow-soft">
            [SYS_MSG] NEW EXPENSE REQUEST REQUIRES AUTHENTICATION.
          </div>

          <TelemetryPanel title="REQ.AWS_CLOUD" className="w-[90%] self-end">
            <div className="flex flex-col gap-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums tracking-tighter">$1,200.00</div>
              <div className="text-accent-critical font-bold tracking-widest text-[10px]">WARN: BUDGET_IMPACT</div>
              <div className="text-text-neutral text-[10px]">REQUESTOR: JANE DOE</div>

              {!approved ? (
                <button 
                  className="mt-4 bg-transparent border border-foreground text-text-primary hover:bg-foreground hover:text-black font-bold p-3 w-full tracking-widest transition-none"
                  onClick={handleReview}
                >
                  [ REVIEW_REQUEST ]
                </button>
              ) : (
                <div className="mt-4 bg-surface-base border border-status-success text-status-success font-bold p-3 w-full text-center tracking-widest">
                  AUTH.VERIFIED: FACE_ID
                </div>
              )}
            </div>
          </TelemetryPanel>
        </div>

        {/* Half Sheet / Modal Intercept */}
        {sheetOpen && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/80 backdrop-blur-sm">
            <div className="bg-surface-card border-t border-text-neutral/20 w-full p-6 pb-12 shadow-soft">
              <h3 className="text-text-primary font-bold mb-6 tracking-widest flex justify-between border-b border-text-neutral/20 pb-2">
                <span>CONTEXT & POLICY</span>
                <span className="text-text-neutral/60">[SEC_L2]</span>
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-end border-b border-text-neutral/10 pb-2">
                  <span className="text-text-neutral">BUDGET_REMAINING</span>
                  <span className="text-accent-critical font-bold tabular-nums tracking-widest">$450.00 [WARN]</span>
                </div>
                <div className="flex justify-between items-end border-b border-text-neutral/10 pb-2">
                  <span className="text-text-neutral">HISTORICAL_SPEND</span>
                  <span className="text-text-primary font-bold tabular-nums tracking-widest">$8,400.00</span>
                </div>
              </div>

              <div className="bg-surface-base border border-text-neutral/20 p-4 mb-6 leading-relaxed text-text-neutral border-l-2 border-l-accent">
                <span className="text-text-primary font-bold block mb-1">SENSO_EVAL:</span> 
                REQUEST EXCEEDS ALLOCATION BY $750. VENDOR (AWS) IS CRITICAL INFRA. OVERRIDE RECOMMENDED TO PREVENT OUTAGE.
              </div>

              <div className="space-y-3">
                <button 
                  className="w-full bg-status-success text-black font-bold border border-status-success p-4 tracking-widest hover:bg-transparent hover:text-status-success transition-none"
                  onClick={handleApprove}
                >
                  [ AUTH_&_ISSUE ]
                </button>
                
                <button 
                  className="w-full bg-transparent text-text-neutral font-bold border border-text-neutral/20 p-4 tracking-widest hover:text-white transition-none"
                  onClick={() => setSheetOpen(false)}
                >
                  [ ABORT ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Face ID Overlay */}
        {faceIdActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
            <div className="w-20 h-20 border-2 border-status-success flex items-center justify-center relative mb-4">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white -translate-x-[2px] -translate-y-[2px]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white translate-x-[2px] -translate-y-[2px]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white -translate-x-[2px] translate-y-[2px]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white translate-x-[2px] translate-y-[2px]" />
              <div className="text-status-success animate-pulse text-4xl">◎</div>
            </div>
            <div className="text-status-success font-bold tracking-widest">AWAITING_BIOMETRIC</div>
          </div>
        )}
      </div>
    </div>
  );
}
