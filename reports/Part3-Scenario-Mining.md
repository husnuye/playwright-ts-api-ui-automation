# Part 3 — Test Strategy & Scenario Mining (Coupon Discount Calculation)

## Problem statement
Customers on an e-commerce site report: **“The total discount is calculated incorrectly when a coupon code is used.”**

Goal: Use an LLM as a partner to explore edge cases, then apply QA judgment to select the most critical scenarios and refine a final Gherkin scenario.

---

## 1) 20 edge case scenarios (LLM-generated, reviewed)
1. Percentage coupon + existing item-level promotion: order of operations causes double-discount or wrong totals.
2. Fixed-amount coupon (e.g., 100) exceeds cart subtotal → negative total or below-zero discount.
3. Coupon applies only to certain categories; mixed cart contains eligible + ineligible items.
4. Coupon applies only to specific SKUs/brands; mixed cart distribution is incorrect.
5. Coupon requires minimum subtotal; applying coupon drops subtotal below threshold (re-check logic).
6. Coupon has maximum discount cap; cap not enforced or enforced incorrectly.
7. Free-shipping coupon combined with percentage coupon: shipping discount counted incorrectly in “total discount.”
8. Single-use coupon reused by same user/session; partial discount still applied.
9. First-order-only coupon: guest vs registered vs returning customer mis-detection.
10. Tax-inclusive vs tax-exclusive calculation: discount applied to wrong base.
11. Shipping included vs excluded from discount base: “subtotal” vs “total” ambiguity.
12. Removing items/changing quantity after applying coupon: recalculation drift.
13. Bundles/kits: coupon allocation across bundle items wrong.
14. Replacing coupon A with coupon B: stale discount remains or stacked unexpectedly.
15. Rounding issues: 0.01 differences due to per-line rounding vs total rounding.
16. Multi-currency/cart currency conversion: coupon value converted incorrectly.
17. Quantity limits: coupon applies only to N items; extra quantity miscounted.
18. Promo price already applied (sale price) + coupon: discount double-counted.
19. Gift card + coupon: application order causes wrong “total discount.”
20. Split shipment / multi-seller: coupon should apply to subset but applied globally.

---

## 2) Top 5 most critical scenarios (selected)
### Top 1 — % coupon + existing item promotion (wrong order/double-discount)
**Why critical:** Common pricing setup; wrong ordering directly impacts revenue and trust.

### Top 2 — Fixed-amount coupon greater than subtotal (negative total / exploit)
**Why critical:** High fraud/abuse risk; can break payment/ledger logic.

### Top 3 — Coupon applies only to eligible items in mixed cart (allocation)
**Why critical:** Frequent source of calculation bugs; needs correct item-level allocation and transparency.

### Top 4 — Min subtotal + max discount cap together (rule engine complexity)
**Why critical:** Two constraints interact; errors lead to over-discount (loss) or under-discount (complaints).

### Top 5 — Rounding rules (0.01 differences, line vs total rounding)
**Why critical:** Small differences trigger customer complaints; mismatch between UI, payment, and invoice.

---

## 3) QA review notes: AI gaps + redundancies
### Risks AI often misses
- **Discount allocation strategy:** pro-rate distribution across items and how rounding affects totals.
- **Order-of-operations definition:** item promos → coupon → tax → shipping (or other) must be explicit and tested.
- **State transitions:** removing items, quantity updates, or switching coupons must re-evaluate correctly.
- **UI vs backend consistency:** checkout UI totals must match invoice/payment totals.
- **Concurrency/double-apply:** coupon apply requests can be retried; idempotency issues can duplicate discount.

### Redundant tests observed
- Multiple “invalid coupon” variations (expired/invalid/usage limit) are mostly validation tests.
  Since the reported bug is *calculation incorrect*, we prioritize calculation and rule interaction scenarios instead.

---

## 4) Most complex scenario (from Top 5)
**Top 4** is the most complex: mixed cart + existing item promo + percent coupon + max cap + minimum threshold + rounding.

---

## 5) Final Gherkin (refined to industry standards)
```gherkin
Feature: Coupon discount calculation

  Background:
    Given the pricing service is available
    And the customer is on the checkout page

  Scenario: Correct total discount for mixed cart with item promotion, coupon cap and minimum threshold
    Given the cart contains:
      | sku   | name           | qty | unit_price | item_promo_type | item_promo_value |
      | A-001 | Running Shoes  | 1   | 120.00     | PERCENT         | 10               |
      | B-010 | Socks (3-pack) | 2   | 25.00      | NONE            | 0                |
    And shipping fee is 10.00
    And tax is calculated on discounted item totals
    And a coupon code "SAVE20" is configured as:
      | type                | value | applies_to           | min_subtotal | max_discount |
      | PERCENT_ON_SUBTOTAL | 20    | ELIGIBLE_ITEMS_ONLY  | 100.00       | 30.00        |
    When the customer applies the coupon code "SAVE20"
    Then item-level promotions should be applied before the coupon discount
    And the coupon discount should apply only to eligible items after item-level promotions
    And the coupon discount should not exceed the maximum discount cap of 30.00
    And the subtotal after all discounts should be greater than or equal to 0.00
    And the total discount displayed should equal the sum of item-level promotions and coupon discount
    And all monetary values should be rounded to 2 decimal places using standard rounding
    And the order total displayed should match the backend invoice total