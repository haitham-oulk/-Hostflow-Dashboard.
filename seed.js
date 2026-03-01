import fs from 'fs'
import { parseBookingsCsv } from './src/lib/bookingUtils.js'

function inject() {
    console.log("Reading CSV files...");
    const csv2025 = fs.readFileSync('C:\\Users\\haith\\Downloads\\HOSTING - hosting 2025 (2).csv', 'utf8')
    const csv2026 = fs.readFileSync('C:\\Users\\haith\\Downloads\\HOSTING -  hosting 2026.csv', 'utf8')

    console.log("Parsing 2025...");
    const res25 = parseBookingsCsv(csv2025, [])
    console.log(`2025 -> Imported: ${res25.importedCount} | Skipped: ${res25.skippedCount}`)

    console.log("Parsing 2026...");
    const res26 = parseBookingsCsv(csv2026, res25.guests)
    console.log(`2026 -> Imported: ${res26.importedCount} | Skipped: ${res26.skippedCount}`)

    const allBookings = [...res25.bookings, ...res26.bookings]
    const allTasks = [...res25.tasks, ...res26.tasks]

    // Create a robust seed for testing
    console.log(`\n--- INJECTION PAYLOAD ---`)
    console.log(`Total Bookings: ${allBookings.length}`)
    console.log(`Total Guests: ${res26.guests.length}`)
    console.log(`Total Cleaning Tasks: ${allTasks.length}`)

    const jsCode = `
    const b = ${JSON.stringify(allBookings)};
    const g = ${JSON.stringify(res26.guests)};
    const t = ${JSON.stringify(allTasks)};
    localStorage.setItem('hostflow_bookings', JSON.stringify(b));
    localStorage.setItem('hostflow_guests', JSON.stringify(g));
    localStorage.setItem('hostflow_tasks', JSON.stringify(t));
    console.log("INJECTED SUCCESSFULLY!");
    `
    fs.writeFileSync('./inject.js', jsCode)
    console.log("Generated inject.js. Execute in browser console.")
}

inject()
