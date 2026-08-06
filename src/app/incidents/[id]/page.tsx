import styles from './workspace.module.css';

export default async function IncidentWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const steps = [
    { label: 'Intent Capture', status: 'complete' },
    { label: 'Senso Knowledge', status: 'complete' },
    { label: 'Policy Evaluation', status: 'complete' },
    { label: 'Linq Approval', status: 'pending' },
    { label: 'Prava Permission', status: 'idle' },
    { label: 'Merchant Checkout', status: 'idle' },
    { label: 'Audit Record', status: 'idle' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Incident Workspace: {id}</h1>
      </header>

      <div className={styles.grid}>
        {/* Zone 1: Summary */}
        <section className={styles.zone}>
          <h2 className={styles.zoneTitle}>Incident Summary</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Merchant</span>
              <span className={styles.statValue}>AWS</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Amount</span>
              <span className={`${styles.statValue} ${styles.amount}`}>$5,400</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Employee</span>
              <span className={styles.statValue}>Sarah Jenkins</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Budget Remaining</span>
              <span className={styles.statValue}>$12,000 (Q3 IT)</span>
            </div>
          </div>
          <div className={styles.policyTrigger}>
            <span className={styles.triggerLabel}>Senso Policy Triggered:</span>
            <span className={styles.triggerValue}>Tx exceeds auto-approve threshold ($5k). Employee noted &quot;Annual AWS commitment&quot;.</span>
          </div>
        </section>

        {/* Zone 2: Decision Canvas */}
        <section className={styles.zone}>
          <h2 className={styles.zoneTitle}>Decision Canvas</h2>
          <div className={styles.decisionBox}>
            <div className={styles.verdict}>
              <span className={styles.verdictLabel}>Policy Verdict:</span>
              <span className={styles.verdictValue}>REQUIRES_LINQ_APPROVAL</span>
            </div>
            <div className={styles.ruleReference}>
              <code>Rule: IT_INFRA_5K_APPROVAL</code>
            </div>
            <button className={styles.approveButton}>
              [ Request Approval via iMessage ]
            </button>
          </div>
        </section>

        {/* Zone 3: Evidence Rail */}
        <section className={`${styles.zone} ${styles.fullWidth}`}>
          <h2 className={styles.zoneTitle}>Evidence Rail</h2>
          <div className={styles.rail}>
            {steps.map((step, index) => (
              <div key={index} className={`${styles.step} ${styles[step.status]}`}>
                <div className={styles.stepDot}></div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
