# sepa-pain-js

A lightweight, fully client-side SEPA XML (ISO 20022 `pain.001.001.03`) viewer and parser written in JavaScript. This tool helps users parse and visualize batch SEPA Credit Transfer XML files directly in the browser — no upload or backend required. 100% privacy in-browser tool, no data collected.

This JS parser implements the following messages out of the ISO 20022 standard:

Credit Transfer Initiation (pain.001.001.03)

_Pain_ is a shortcut for _Payment Initiation_.

---

## 💡 What It Does

- Parses SEPA XML payment files (`pain.001.001.03`, i.e. CustomerCreditTransferInitiationV03)
- Displays all individual transactions in an interactive table
- Supports multiple `<PmtInf>` blocks
- Lets users download the entire transaction table as CSV
- Allows selection of a single transaction and download of a valid SEPA XML for that one transaction only

---

## 🛠️ Use Cases

- Financial operations teams previewing generated SEPA files
- Developers working on ERP-to-bank payment integrations
- QA & compliance checking of XML-based payment instructions
- Educational/demo tool for ISO 20022-based SEPA standards

---

## 📁 Supported Message Format

- `pain.001.001.03` (SEPA Credit Transfer)
- Based on the ISO 20022 standard, widely used across the EU

---

## 🧪 Live Demo

> Run locally by opening `index.html` in your browser.

No dependencies. No build steps. Just drop in your SEPA XML file.

---

## 📥 Output

- **Table view** of all SEPA payments
- **CSV export** of parsed transactions
- **SEPA XML file** generation for a selected transaction (converts from batch SEPA payment XML file to desired single transaction XML file)

---

## 🔐 Security

Everything runs locally in your browser.
- No data is sent to any server.
- Ideal for use with sensitive or confidential SEPA files.

---

## 📜 License

MIT — free to use, modify, and integrate.

---

## 🤝 Contributions

PRs and suggestions are welcome! This tool is useful for accountants, book keepers, finance teams, developers, and anyone handling SEPA XMLs.

