# Projektarbeitdokumentation

Projektmitglieder:
 * Andreas Pointner
 * Dominik Köberl

Genutzte KI-Werkzeuge:
 * Gemini Chat (für Dokumentation und Erklärungen)
 * Gemini CLI (für Test-Idee-Erzeugung)
 
 ---

### Beschreibung der Web-Anwendung:
TODO

---

### Test Setup:
TODO:
Beschreiben -> Testbeschreibung, Testframework(s), Test Ausführung, Loadtests (Art, Zweck) + visualisieren und analysieren Sie die daraus resultierenden Ergebnisse

#### CI(/CD) Pipeline
Zur Automatisierung des Testprozesses und zur Qualitätssicherung bei jeder Code-Änderung wurde eine Continuous Integration (CI) Pipeline mittels GitHub Actions implementiert. Die Konfiguration ist in der Datei `.github/workflows/build.yml` hinterlegt.

Die Pipeline ist bewusst in zwei logische Phasen (Jobs) unterteilt, um eine klare Trennung zwischen Vorbereitung und Validierung zu gewährleisten:

* Build-Job: \
    Zweck: Überprüfung der Build-Fähigkeit der Applikation. \
    Ablauf: Der Quellcode wird ausgecheckt, eine stabile Node.js-Umgebung (Version 20.x) aufgesetzt und die Projektabhängigkeiten werden deterministisch über npm ci installiert.

* Test-Job: \
    Zweck: Validierung der Code-Qualität über verschiedene Systemumgebungen hinweg. \
    Ablauf: Der Job läuft erst an, wenn der Build-Job erfolgreich war (needs: build). Um die Abwärts- und Zukunftskompatibilität der modernisierten Anwendung zu garantieren, wird hier eine Test-Matrix eingesetzt.

#### Test Isolation & Caching in der Pipeline
Ein zentraler Qualitätsaspekt des gesamten Test-Setups ist die vollständige Isolation innerhalb der Pipeline-Runner:

* Keine externen Abhängigkeiten: \
    Da die Anwendung ohne einer Datenbank auskommt (Datenbasis via products.json, Session-Handling im RAM), benötigt die Pipeline keine fehleranfälligen Docker-Container oder Datenbank-Dienste im Runner. Die Tests laufen isoliert im Memory des GitHub-Zerspaners.

* Deterministische Installation: \
    Durch die Verwendung von npm ci (Clean Install) statt npm install wird garantiert, dass die Pipeline exakt die in der package-lock.json eingefrorenen Paketversionen nutzt. Seiteneffekte durch nachträglich aktualisierte Third-Party-Pakete werden somit ausgeschlossen.

* GitHub Action Caching:\
    Durch das Flag cache: 'npm' werden die npm-Pakete auf den GitHub-Servern zwischengespeichert. Dies reduziert die Installationszeit pro Pipeline-Lauf auf wenige Sekunden und schont die Ressourcen.
