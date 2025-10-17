# Revenue tracking

This repo now tracks platform revenue with a dedicated collection and API.

- Model: `models/RevenueEntry.ts`
- Public API: `app/api/revenue/route.ts`
- Admin API: `app/api/admin/revenue/route.ts`
- Manual payments automatically log income when created: `app/api/monetization/manual-payment/route.ts`

## Data shape

RevenueEntry fields:

- type: "income" | "expense" | "withdrawal"
- amount: number (>= 0)
- currency: string (e.g., "LRD" | "USD")
- source?: string (e.g., "manual_payment", "admin_panel")
- referenceId?: string (link to related id like ManualPayment.\_id)
- note?: string
- meta?: any
- createdBy?: ObjectId
- createdAt/updatedAt: Date

## Endpoints

1. POST /api/monetization/manual-payment

- On every request, an income line is inserted in revenue with source=manual_payment.

2. GET /api/revenue

- List entries with filters: ?type=&currency=&source=&from=&to=&page=&pageSize=

3. GET /api/revenue?stats=true[&from=ISO&to=ISO][&currency=LRD]

- Returns totals grouped by currency: income, expense, withdrawal, net.

4. POST /api/admin/revenue

- Admin-only creation of expense/withdrawal (deducts from net):

Body:

```
{ "type": "expense"|"withdrawal", "amount": 100, "currency": "LRD", "note": "Marketing", "destination": "bank", "meta": {"category":"ads"} }
```

- If type=withdrawal, also inserts a `WithdrawalLog` item with the same amount/note/destination.

## Notes

- Stats compute net = income - expense - withdrawal per currency.
- For strict RBAC on /api/revenue POST, gate expense/withdrawal to admins only. The admin endpoint already enforces admin tokens.
- If a manual payment is later refunded/voided, consider inserting an `expense` entry with source="refund" to offset the income.
