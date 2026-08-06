"use client";

import Link from "next/link";

export default function PravaDashboard() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700" }}>Prava Dashboard</h1>
        <Link href="/demo/imessage" style={{ padding: "10px 20px", background: "#000", color: "#fff", borderRadius: "8px", textDecoration: "none" }}>
          Back to iMessage Simulator
        </Link>
      </div>
      
      <div style={{ padding: "24px", background: "#f8f9fa", borderRadius: "16px", border: "1px solid #eaeaea" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "16px", color: "#333" }}>Recent Activity</h2>
        
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #eaeaea", marginBottom: "12px" }}>
          <div>
            <div style={{ fontWeight: "600", fontSize: "16px" }}>Single-Merchant Card Issued</div>
            <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>AWS Cloud Services • Approved via Face ID</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "600", fontSize: "16px" }}>$1,200.00</div>
            <div style={{ color: "#34c759", fontSize: "14px", marginTop: "4px", fontWeight: "600" }}>Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
