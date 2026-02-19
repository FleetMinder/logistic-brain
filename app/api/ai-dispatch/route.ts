import { NextRequest, NextResponse } from "next/server"

interface DispatchRequest {
    userQuery: string
    context: {
        drivers: Array<{
            id: string
            name: string
            surname: string
            isAvailable: boolean
            dailyHoursUsed: number
            weeklyHoursUsed: number
            adrCertificate: boolean
            licenseDeadline: string
            cqcDeadline: string
            notes: string | null
        }>
        vehicles: Array<{
            id: string
            plate: string
            brand: string
            model: string
            type: string
            maxCapacityKg: number
            maxCapacityM3: number | null
            isAvailable: boolean
            revisionDeadline: string
            insuranceDeadline: string
            notes: string | null
        }>
        trips: Array<{
            id: string
            status: string
            cargoType: string
            cargoWeight: number
            isInternational: boolean
            isAdr: boolean
            startDate: string
            totalKm: number
            estimatedCost: number
            stops: Array<{ city: string; type: string }>
            driverId: string | null
            vehicleId: string | null
        }>
    }
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                {
                    error: "GEMINI_API_KEY non configurata",
                    details:
                        "Aggiungi GEMINI_API_KEY nel file .env.local per abilitare l'AI Dispatch. Puoi ottenere una chiave su https://aistudio.google.com/",
                },
                { status: 503 }
            )
        }

        const body: DispatchRequest = await req.json()
        const { userQuery, context } = body

        // Build a rich, structured Italian prompt
        const driversSection = context.drivers
            .map(
                (d) =>
                    `- **${d.name} ${d.surname}** (ID: ${d.id})
    • Stato: ${d.isAvailable ? "✅ Disponibile" : "🔴 In servizio"}
    • Ore guida oggi: ${d.dailyHoursUsed}h / 9h limite giornaliero
    • Ore guida settimana: ${d.weeklyHoursUsed}h / 56h limite settimanale
    • Certificato ADR: ${d.adrCertificate ? "✅ Sì" : "❌ No"}
    • Scadenza patente: ${new Date(d.licenseDeadline).toLocaleDateString("it-IT")}
    • Scadenza CQC: ${new Date(d.cqcDeadline).toLocaleDateString("it-IT")}
    ${d.notes ? `• Note: ${d.notes}` : ""}`
            )
            .join("\n\n")

        const vehiclesSection = context.vehicles
            .map(
                (v) =>
                    `- **${v.brand} ${v.model}** — Targa: ${v.plate} (ID: ${v.id})
    • Tipo: ${v.type} | Capac.: ${v.maxCapacityKg.toLocaleString("it-IT")} kg${v.maxCapacityM3 ? ` / ${v.maxCapacityM3} m³` : ""}
    • Stato: ${v.isAvailable ? "✅ Disponibile" : "🔴 In uso"}
    • Revisione: ${new Date(v.revisionDeadline).toLocaleDateString("it-IT")}
    • Assicurazione: ${new Date(v.insuranceDeadline).toLocaleDateString("it-IT")}
    ${v.notes ? `• Note: ${v.notes}` : ""}`
            )
            .join("\n\n")

        const tripsSection = context.trips
            .map(
                (t) =>
                    `- **${t.cargoType}** — ${t.totalKm.toLocaleString("it-IT")} km (ID: ${t.id})
    • Stato: ${t.status} | Data: ${new Date(t.startDate).toLocaleDateString("it-IT")}
    • Peso: ${t.cargoWeight.toLocaleString("it-IT")} kg | Costo stimato: €${t.estimatedCost.toLocaleString("it-IT")}
    • ADR: ${t.isAdr ? "⚠️ Sì" : "No"} | Internazionale: ${t.isInternational ? "🌍 Sì" : "No"}
    • Percorso: ${t.stops.map((s) => `${s.city} (${s.type})`).join(" → ")}
    • Autista assegnato: ${t.driverId || "❌ Non assegnato"}
    • Veicolo assegnato: ${t.vehicleId || "❌ Non assegnato"}`
            )
            .join("\n\n")

        const systemPrompt = `Sei un esperto di logistica e ottimizzazione dei trasporti per aziende italiane. Conosci perfettamente:
- Il Regolamento CE 561/2006 sui tempi di guida e riposo
- La normativa ADR per il trasporto di merci pericolose
- La Convenzione CMR per i trasporti internazionali
- Le best practice per l'ottimizzazione delle rotte e la riduzione dei costi
- La gestione delle flotte di trasporto su strada in Italia

Rispondi SEMPRE in italiano, in modo chiaro, professionale e strutturato. Usa le emoji per rendere più leggibile la risposta.
Fornisci raccomandazioni concrete, specifiche e motivate, citando i dati reali degli autisti e veicoli forniti.`

        const userPrompt = `## SITUAZIONE ATTUALE DELLA FLOTTA

### AUTISTI (${context.drivers.length} totali)
${driversSection}

### VEICOLI (${context.vehicles.length} totali)
${vehiclesSection}

### VIAGGI (${context.trips.length} totali)
${tripsSection}

---

## RICHIESTA DI OTTIMIZZAZIONE

${userQuery}

---

Rispondi con:
1. **📊 Analisi della situazione attuale** — punti critici, opportunità, vincoli normativi rilevanti
2. **🎯 Raccomandazioni specifiche** — assegnazioni autista/veicolo/viaggio con motivazioni tecniche
3. **⚠️ Avvisi e vincoli** — scadenze imminenti, limiti ore di guida, requisiti ADR/internazionale
4. **💡 Ottimizzazioni aggiuntive** — suggerimenti per ridurre costi, aumentare efficienza
5. **📈 Score di ottimizzazione stimato** — percentuale da 0 a 100% rispetto al massimo teorico`

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }],
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: userPrompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        )

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error("Gemini API error:", errorText)
            return NextResponse.json(
                { error: "Errore nella risposta dell'AI", details: errorText },
                { status: 502 }
            )
        }

        const geminiData = await geminiResponse.json()
        const aiText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Nessuna risposta dall'AI."

        return NextResponse.json({ result: aiText })
    } catch (error) {
        console.error("AI Dispatch error:", error)
        return NextResponse.json(
            { error: "Errore interno del server", details: String(error) },
            { status: 500 }
        )
    }
}
