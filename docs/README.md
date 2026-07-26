# QRasoi Documentation

## Overview

This folder contains the complete Product Requirement Documentation (PRD), Design System, Development Standards, UI Specifications, User Flows, and Frontend Constraints for the QRasoi platform.

Every markdown file inside this directory acts as the single source of truth for frontend development.

The frontend must strictly follow these documents.

Nothing should be assumed.

Nothing should be redesigned.

Nothing should be implemented differently unless explicitly updated inside these documents.

---

# What is QRasoi

QRasoi is a lightweight SaaS platform that enables restaurants, cafés, dhabas and food outlets to replace printed menus with a digital QR menu while managing customer orders through a simple dashboard.

The objective is simplicity.

QRasoi is built for restaurant owners who are not highly technical.

The application must feel effortless.

---

# Product Philosophy

QRasoi is NOT an enterprise software.

QRasoi is NOT a POS.

QRasoi is NOT a restaurant ERP.

QRasoi is NOT a billing software.

QRasoi is NOT an inventory management platform.

QRasoi focuses on one problem only

Allow restaurants to receive customer orders digitally through a QR menu.

Everything inside the product should support this goal.

---

# Documentation Order

Always read the documents in the following order before making changes.

1. README.md

2. 00-project-overview.md

3. 01-product-rules.md

4. 02-tech-stack.md

5. 03-design-system.md

6. Remaining documentation

---

# Frontend Development Rules

Every UI must follow the Design System.

Every screen must be mobile-first.

Every component must be reusable.

Every spacing value must follow the spacing scale.

Every color must come from the design tokens.

Every font must follow typography guidelines.

No custom styling outside the design system.

---

# Decision Making

If documentation exists,

documentation wins.

If documentation conflicts with assumptions,

documentation wins.

If documentation is missing,

DO NOT implement.

Ask instead.

Never invent features.

Never invent screens.

Never invent user flows.

Never redesign layouts.

Never rename components.

---

# Product Goal

The complete product should feel like it was designed by a single designer and developed by a single frontend engineer.

Every screen should have visual consistency.

Every interaction should feel predictable.

Every animation should have a purpose.

Every page should be fast.

Every component should be reusable.

---

End of File