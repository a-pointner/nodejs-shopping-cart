# Projektarbeitdokumentation

Projektmitglieder:
 * Andreas Pointner
 * Dominik Köberl

Genutzte KI-Werkzeuge:
 * Gemini Chat (für Dokumentation und Erklärungen)
 * Gemini CLI (für Test-Idee-Erzeugung)
 
 ---

## Beschreibung der Web-Anwendung:
Die Webanwendung basiert auf einem Node.js-Backend mit dem Express-Framework und dient als funktionaler Warenkorb-Prototyp. Das Projekt demonstriert das Zusammenspiel von serverseitigem Routing, Middleware-basiertem Session-Handling und template-basierter Frontend-Logik mittels Handlebars (HBS).

Die Anwendungsarchitektur ist dabei modular gegliedert. Zentral für die Logik sind insbesondere das Warenkorb-Modell `models/cart.js`, welches die Datenintegrität bei Session-Mutationen sicherstellt, sowie die Express-Routen `routes/index.js`, die für das Routing der HTTP-Anfragen verantwortlich sind. Da die Datenhaltung ausschließlich im RAM erfolgt und auf eine persistente Datenbank verzichtet wird, stellt die Validierung dieser zuvor erwähnten Komponenten den Kern unserer Teststrategie dar.

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

### Lasttests mit k6:
Um die Stabilität unter Last zu verifizieren, haben wir Lasttests mit Grafana k6 implementiert.

**Spike Test:** Um das Antwortverhalten der Anwendung unter Last zu validieren, haben wir Spike-Tests mit inkrementell steigenden Nutzerzahlen durchgeführt. Als zentrale Kennzahl dient dabei der p95-Wert, der angibt, dass 95 % aller Anfragen innerhalb dieses Zeitfensters erfolgreich verarbeitet wurden. Dieser Wert bietet ein realistisches Bild der User Experience, da er Ausreißer sinnvoll ausklammert.

![p95 Diagramm](/data/spike-test-p95-diagram.png)

Die Testergebnisse zeigen ein klares Skalierungsverhalten: Während die Anwendung bis zu einem Schwellenwert von 500 Nutzern eine exzellente Performance liefert, beginnt ab diesem Punkt eine messbare Degradation. Mit steigender Nutzerzahl nimmt die Sättigung des Node.js-Event-Loops zu, was die Antwortzeiten sukzessive ansteigen lässt. Ab einer Last von 1.500 Nutzern überschreitet die Latenz die 500-ms-Marke, wodurch die Anwendung für Endanwender spürbar träger reagiert.

![3000 Nutzer Test Ergebnis](/data/spike_3000-test-result.png)
Bei einem Test mit 3.000 gleichzeitigen Nutzern erreichte das System schließlich seinen sogenannten Breaking Point. Die Fehlerrate stieg auf 9,65 % an, was auf eine Überlastung der Server-Ressourcen hindeutet.

Zusammenfassend lässt sich festhalten, dass die Architektur für Szenarien bis 500 Nutzer optimal ausgelegt ist. Das Erreichen der Belastungsgrenze bei 3.000 Nutzern liefert wertvolle Erkenntnisse für den Betrieb: Für eine Skalierung auf höhere Lastspitzen wäre der Einsatz von Load-Balancing oder anderer Maßnahmen notwendig.

**Soak Test:** Wir führten einen 10-minütigen Dauertest durch, um die Stabilität des RAM-basierten Session-Managements zu prüfen. Da der Speicherverbrauch konstant blieb, konnte der Ausschluss von Memory Leaks im Session-Handling nachgewiesen werden.

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
