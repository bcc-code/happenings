# Finance Module - Requirements & Planning

## Overview

The Finance module handles payment processing, invoicing, pricing, financial reporting, and integration with payment provider plugins.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Pricing & Fees

- [ ] **Pricing Models**
  - Flat rate pricing
  - Tiered pricing (early bird, regular, late)
  - Per-session pricing
  - Add-on pricing (meals, resources, etc.)
  - Discount codes/coupons
  - Group pricing

- [ ] **Fee Structure**
  - Registration fees
  - Processing fees
  - Currency support (multi-currency)
  - Tax calculation
  - Refund policies

### Payment Processing

- [ ] **Payment Provider Integration**
  - Plugin-based architecture
  - Multiple providers per tenant
  - Payment method support (credit card, bank transfer, etc.)
  - Webhook handling
  - Payment status tracking

- [ ] **Payment Flow**
  - Payment initiation
  - Payment confirmation
  - Payment failure handling
  - Partial payments
  - Payment plans/installments

### Invoicing

- [ ] **Invoice Generation**
  - Automatic invoice generation
  - Invoice templates
  - Invoice numbering
  - PDF generation
  - Email delivery

- [ ] **Invoice Management**
  - Invoice history
  - Invoice status (pending, paid, overdue, cancelled)
  - Invoice modifications
  - Credit notes

### Financial Reporting

- [ ] **Reports**
  - Revenue reports
  - Payment status reports
  - Outstanding invoices
  - Refund reports
  - Tax reports
  - Payment provider reconciliation

## Database Schema (Planned)

```sql
-- Pricing tiers
pricing_tiers (
  id, event_id, name, price,
  currency, start_date, end_date,
  capacity_limit, is_active
)

-- Discount codes
discount_codes (
  id, tenant_id, code, discount_type,
  discount_value, min_purchase, max_uses,
  valid_from, valid_until, is_active
)

-- Registrations (with pricing)
registrations (
  id, user_id, event_id, pricing_tier_id,
  base_price, discount_amount, tax_amount,
  total_amount, currency, status,
  registered_at, payment_due_date
)

-- Invoices
invoices (
  id, registration_id, invoice_number,
  amount, currency, tax_amount,
  status, issued_at, due_date,
  paid_at, pdf_url
)

-- Payments
payments (
  id, registration_id, invoice_id,
  amount, currency, payment_method,
  provider, provider_transaction_id,
  status, processed_at, failure_reason
)

-- Payment provider configurations
payment_provider_configs (
  id, tenant_id, provider_plugin_id,
  config_data, is_active, is_default
)

-- Refunds
refunds (
  id, payment_id, amount, reason,
  status, processed_at, refund_method
)
```

## API Endpoints (Planned)

### Pricing
- `GET /api/events/:eventId/pricing` - Get pricing tiers
- `POST /api/events/:eventId/pricing` - Create pricing tier (admin)
- `PUT /api/pricing/:id` - Update pricing tier (admin)

### Discount Codes
- `GET /api/discount-codes` - List discount codes (admin)
- `POST /api/discount-codes` - Create discount code (admin)
- `POST /api/discount-codes/validate` - Validate discount code
- `PUT /api/discount-codes/:id` - Update discount code (admin)

### Payments
- `POST /api/registrations/:id/payment` - Initiate payment
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/:id/webhook` - Payment provider webhook
- `POST /api/payments/:id/refund` - Process refund (admin)

### Invoices
- `GET /api/invoices` - List invoices (user or admin)
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/pdf` - Download invoice PDF
- `POST /api/invoices/:id/send` - Send invoice email (admin)

### Financial Reports
- `GET /api/admin/finance/revenue` - Revenue report (admin)
- `GET /api/admin/finance/payments` - Payment status report (admin)
- `GET /api/admin/finance/outstanding` - Outstanding invoices (admin)

## Payment Provider Plugin Interface

### Required Methods

```typescript
interface PaymentProvider {
  // Initialize payment
  initiatePayment(params: PaymentParams): Promise<PaymentResponse>;
  
  // Check payment status
  checkPaymentStatus(transactionId: string): Promise<PaymentStatus>;
  
  // Process refund
  processRefund(params: RefundParams): Promise<RefundResponse>;
  
  // Handle webhook
  handleWebhook(payload: any): Promise<WebhookResult>;
  
  // Get configuration UI
  getConfigUI(): ConfigUIComponent;
  
  // Validate configuration
  validateConfig(config: any): ValidationResult;
}
```

### Supported Payment Methods

- Credit/Debit Cards
- Bank Transfer
- Mobile Money (M-Pesa, etc.)
- Digital Wallets
- Cryptocurrency (optional)
- Cash on arrival (mark as paid)

## UI Components (Planned)

### Admin Dashboard
- Pricing management interface
- Discount code management
- Payment provider configuration
- Invoice management
- Financial reports dashboard
- Refund processing interface

### End User App
- Pricing display
- Discount code entry
- Payment form
- Payment status tracking
- Invoice viewing and download
- Payment history

## Currency Support

- [ ] Multi-currency support
- [ ] Currency conversion (if needed)
- [ ] Currency display formatting
- [ ] Payment provider currency mapping

## Tax Handling

- [ ] Tax calculation rules
- [ ] Tax rate configuration per tenant
- [ ] Tax-exempt status support
- [ ] Tax reporting

## Refund Policy

- [ ] Refund rules configuration
- [ ] Automatic refund processing
- [ ] Partial refunds
- [ ] Refund approval workflow
- [ ] Refund method selection

## Integration Points

- **Program Module**: Session pricing
- **Catering Module**: Meal pricing
- **Resources Module**: Paid resources
- **Communication Module**: Payment confirmations, invoice emails

## Open Questions

- [ ] How to handle payment failures and retries?
- [ ] Should there be payment plans/installments?
- [ ] How to handle currency conversion?
- [ ] Should there be automatic invoice generation?
- [ ] How to handle partial payments?
- [ ] Should there be a payment deadline?
- [ ] How to handle refund processing time?
- [ ] Should there be payment reminders?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
