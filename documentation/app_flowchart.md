flowchart TD
    A[Dashboard Page] --> B[Click Add Commission Button]
    B --> C[Open AddCommissionModal]
    C --> D[Submit Form]
    D -->|Valid Input| E[Call addCommission on Store]
    D -->|Invalid Input| F[Show Validation Errors]
    E --> G[Save Data in IndexedDB via Dexie]
    G --> H[Update Store Internal State]
    H --> I[Re-render CommissionList and SummaryCards]