# Projektarbeitdokumentation

Projektmitglieder:
 * Andreas Pointner
 * Dominik Köberl

Genutzte KI-Werkzeuge:
 * Gemini Chat (für Dokumentation und Erklärungen)
 * Gemini CLI (für Test-Idee-Erzeugung)
 
 ---

## Beschreibung der Web-Anwendung:
TODO

---

## Test Setup:
TODO:
Beschreiben -> Testbeschreibung, Loadtests (Art, Zweck) + visualisieren und analysieren Sie die daraus resultierenden Ergebnisse

### Teststrategie & Frameworks
Um eine hohe Code-Qualität und Stabilität der Applikation zu gewährleisten, verfolgen wir einen zweigeteilten Testansatz, der auf dem Prinzip der Testpyramide basiert:

#### Unit- & Integration-Tests (Jest):
**Zweck:** Validierung der Geschäftslogik und des Routings in einer isolierten Node.js-Umgebung.

**Framework:** Jest fungiert als Test-Runner und Assertion-Library. Es prüft die Kernlogik des Warenkorb-Modells (models/cart.js) und die Express-Routen unabhängig vom Frontend.

**Vorteil:** Schnelle Ausführung ("Fast Feedback Loop"), ideal für die CI/CD-Pipeline zur sofortigen Erkennung von Regressionsfehlern.

#### System- & E2E-Tests (Playwright):
**Zweck:** Validierung der vollständigen "User Journeys" aus der Perspektive eines echten Anwenders.

**Framework:** Playwright automatisiert den gesamten Browser-Stack (Chromium, Firefox, WebKit). Es simuliert echte Benutzerinteraktionen wie das Hinzufügen von Artikeln, Warenkorb-Navigation und Session-Persistenz.

**Vorteil:** Deckt die Brücke zwischen Frontend und Backend ab. Es stellt sicher, dass die Applikation trotz des dynamischen Session-Managements im Browser wie erwartet funktioniert.

### CI/CD Pipeline & Test-Ausführung
Zur Automatisierung des Testprozesses und zur Qualitätssicherung bei jeder Code-Änderung wurden zwei spezialisierte GitHub Actions Pipelines implementiert:

#### Build & Unit-Test Pipeline (build.yml):
**Build-Job:** Überprüfung der Build-Fähigkeit. Der Quellcode wird ausgecheckt, eine stabile Node.js-Umgebung (Version 20.x) aufgesetzt und Abhängigkeiten via npm ci deterministisch installiert.

**Test-Job:** Validierung der Code-Qualität über eine Matrix-Umgebung (Node.js 18.x, 20.x, 22.x). Der Job läuft erst an, wenn der Build-Job erfolgreich war (needs: build).

#### E2E-Test Pipeline (playwright.yml):
**Zweck:** Validierung des Gesamtsystems in einer produktionsnahen Umgebung.

**Ablauf:** Die Pipeline startet den Express-Server via webServer-Konfiguration, führt die Playwright-Suite aus und erstellt bei Fehlern automatisch Berichte (playwright-report) zur Fehleranalyse.

#### Test Isolation & Caching:
Ein zentraler Qualitätsaspekt ist die vollständige Isolation innerhalb der Pipeline-Runner:

**Keine externen Abhängigkeiten:** Da die Anwendung ohne Datenbank auskommt (Datenbasis via products.json, Session-Handling im RAM), benötigt die Pipeline keine fehleranfälligen Datenbank-Dienste. Die Tests laufen isoliert im Memory der GitHub-Runner.

**Deterministische Installation:** Durch die Verwendung von npm ci (Clean Install) wird garantiert, dass die Pipeline exakt die in der package-lock.json eingefrorenen Paketversionen nutzt.

**GitHub Action Caching:** Durch das Flag cache: 'npm' werden die Pakete zwischengespeichert. Dies reduziert die Installationszeit auf wenige Sekunden und schont die Ressourcen.
