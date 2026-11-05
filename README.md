# Siraha Grader Roller Rental Service

A multi-page Next.js + TypeScript + Tailwind CSS website starter for a heavy construction equipment rental service based in Lahan, Siraha.

## Pages
- `/` — long-form business landing page
- `/grader` — grader rental
- `/roller` — road roller rental
- `/excavator` — excavator rental
- `/booking` — booking and contact form

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Booking form behaviour
The form defaults to **Book a machine**. It collects name, contact number, machine, start/end dates, project location and optional details. General Contact mode asks for a description. Submission opens WhatsApp with the request prefilled for `+977 9702803911`.

This is a front-end handoff only: it does not store submissions or guarantee a booking. The business must confirm availability, price, transport, operator arrangements and rental terms directly.

## Before launch
1. Replace stock machine photos with photographs of your actual rental fleet where possible.
2. Confirm the exact public business name and service coverage.
3. Confirm whether rental includes an operator, fuel, transport and minimum rental period; add the agreed details to the pages.
4. Add a privacy notice and a server-side form/email/CRM endpoint if submissions should be stored instead of opening WhatsApp.
5. Test all phone, WhatsApp and booking flows on mobile.

## Image source notes
The starter references online illustrative machine photos:
- Grader: Caterpillar media image (`s7d2.scene7.com`, Cat 140M)
- Roller: JCB product media image (`jcb.com`, tandem roller)
- Excavator: La Centrale TP image (`lacentraletp.fr`)
- Additional grader image: Substrata equipment image (`substrata.us`)

These are remote hotlinked image URLs for prototyping, not a grant of commercial reuse rights. Check each source's license/permission before publishing commercially, or use your own machine photographs / properly licensed stock.
