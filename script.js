document.addEventListener("DOMContentLoaded", function() {
    const logForm = document.getElementById('logForm');
    const logTableBody = document.getElementById('logTable').getElementsByTagName('tbody')[0];
    const saveButton = document.getElementById('saveButton');
    
    logForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const callsign = document.getElementById('callsign').value;
        const frequency = document.getElementById('frequency').value;
        const sentReport = document.getElementById('sentReport').value;
        const receivedReport = document.getElementById('receivedReport').value;
        
        const utcTime = convertToUTC(date, time);
        
        addLogEntry(date, utcTime, callsign, frequency, sentReport, receivedReport);
        logForm.reset();
    });
    
    function convertToUTC(date, time) {
        const localDate = new Date(date + 'T' + time);
        return localDate.toISOString().substring(11, 16); // Return only the time part (HH:MM)
    }

    function addLogEntry(date, utcTime, callsign, frequency, sentReport, receivedReport) {
        const logEntry = { date, time: utcTime, callsign, frequency, sentReport, receivedReport };
        let logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries.push(logEntry);
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
        appendLogEntryToTable(logEntry);
    }

    function appendLogEntryToTable(logEntry) {
        const row = logTableBody.insertRow();
        row.insertCell(0).textContent = logEntry.date;
        row.insertCell(1).textContent = logEntry.time;
        row.insertCell(2).textContent = logEntry.callsign;
        row.insertCell(3).textContent = logEntry.frequency;
        row.insertCell(4).textContent = logEntry.sentReport;
        row.insertCell(5).textContent = logEntry.receivedReport;
    }
    
    function loadLogEntries() {
        const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries.forEach(entry => appendLogEntryToTable(entry));
    }

    function saveToCSV() {
        const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        if (logEntries.length === 0) {
            alert("Ingen loggdata att spara");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,Datum,Tid (UTC),Callsign,Frekvens,Skickad signalrapport,Mottagen signalrapport\n";
        logEntries.forEach(entry => {
            const row = `${entry.date},${entry.time},${entry.callsign},${entry.frequency},${entry.sentReport},${entry.receivedReport}`;
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "radio_log.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    saveButton.addEventListener('click', saveToCSV);
    loadLogEntries();
});
