
library(data.table)

setwd("/home/georg/reboting/uploaded_data/")

fb <- fread("FB_insights.csv")

titles <- names(fb)

# altes format (!!!)Daten mit der alten Vorlage exportieren 

# Seitendaten

# Anzahl Fans, H(33) (eigentlich likes) 
# Netto Fanwachstum, Unterschied letzter Monat zu diesem 
# Netto Fanwachstum der letzten 3 Monate durch 3
### für das Fanwachstum brauchen wir schon wieder mehrere Excel files

# Reichweite: Q(33) 28 Tage Gesamtreichweite (letzter EIntrag = unique User der letzten 28 Tage)
# oder tägliche Gesamtreichtweite summieren)

# Bezahlte Reichweite: 28 T, unique user W
# oder tägliche U

# Organische Reichweite: Gesamtreichte - bezahlte Reichweite
# ORganische REichweite %

# Impressionen: AA für tägliche, oder AC für unique user 28 Tage durchrechnungszeitraum (besser)
# PTA: tägliche: B, oder D für 28 Tage durchrechnungszeitraum

# Beitragsdaten (für Postings und Interaktionen)
# Anzahl Postings (direkt aus Facebook auslesen)
# 2. Tab dieser Liste (Laufzeit Personen ...), zusammenzählen
# Interaktionen im selben Tab (alle Comments likes und Shares zusammenrechnen)

# Anzahl Links werden händisch rausgesucht (jedes Posting das einen Link enthält)
# Klicks: über bit.ly (Linkkonverter)
# (weil FB nicht vertraut wird)

# User Beiträge inkl. Nachrichten (Unique)... aus dem CMS Tool
# Comments and Replies (auch aus dem CMS Tool)

# Interaktionen durch Gewinnspiele (händisch)
# Interaktionen bereinigt (händisch)

# Instagram (händisch)
# Instagram (händisch)

