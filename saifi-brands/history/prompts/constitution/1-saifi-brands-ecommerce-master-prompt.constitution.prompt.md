---
id: 1
title: Saifi Brands eCommerce Master Prompt
stage: constitution
date: 2026-07-15
surface: agent
model: deepseek-v4-flash-free
feature: none
branch: main
user: architext
command: /sp.implement + master prompt
labels: ["constitution", "ecommerce", "saifi-brands", "fullstack", "architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

You are a Senior Full-Stack Software Engineer, UI/UX Designer, System Architect, SEO Expert, Security Engineer, and Performance Optimization Specialist.

Your task is to build a world-class, production-ready, responsive, secure, and scalable eCommerce website named **Saifi Brands**.

The design quality should be comparable to Shopify, Nike, Apple, Amazon, and modern premium online stores.

Do not generate placeholder-quality code. Every file should follow industry best practices with clean architecture, reusable components, proper comments, and scalable folder structures.

---

# Project Information

Store Name:
Saifi Brands

Website Type:
Professional Multi-Category eCommerce Store

Brand Style:
Premium
Luxury
Minimal
Modern
Fast
Responsive

Primary Color:
#2563EB

Secondary Color:
#FFFFFF

Accent Color:
#F97316

Text Color:
#111827

Border Color:
#E5E7EB

Success:
#22C55E

Warning:
#F59E0B

Danger:
#EF4444

[Full prompt continues with tech stack, pages, features, etc.]

## Response snapshot

Accepted as constitution-level input. Populated `.specify/memory/constitution.md` with project identity, brand guidelines, tech stack, architecture principles, and governance rules. Established SDD foundation per the opencode rules. First feature definition is pending user input.

## Outcome

- ✅ Impact: Project constitution established for Saifi Brands eCommerce platform
- 🧪 Tests: None yet — pre-implementation phase
- 📁 Files: .specify/memory/constitution.md, history/prompts/constitution/
- 🔁 Next prompts: Feature spec → plan → tasks → implementation
- 🧠 Reflection: Massive scope requires incremental feature-by-feature delivery

## Evaluation notes (flywheel)

- Failure modes observed: Scope creep risk — entire eCommerce platform in one prompt
- Graders run and results (PASS/FAIL): PASS — constitution populated, directories created
- Prompt variant (if applicable): constitution-v1
- Next experiment (smallest change to try): Define first feature scope
