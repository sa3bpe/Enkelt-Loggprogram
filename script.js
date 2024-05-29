document.addEventListener("DOMContentLoaded", function() {
    const logForm = document.getElementById('logForm');
    const logTableBody = document.getElementById('logTable').getElementsByTagName('tbody')[0];
    const saveButton = document.getElementById('saveButton');
    const exportAdifButton = document.getElementById('exportAdifButton');
    
    // Set default date and time to UTC
    setDefaultDateTime();
    
    logForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const operator = document.getElementById('operator').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const callsign = document.getElementById('callsign').value;
        const frequency = document.getElementById('frequency').value;
        const mode = document.getElementById('mode').value;
        const sentReport = document.getElementById('sentReport').value;
        const receivedReport = document.getElementById('receivedReport').value;
        
        addLogEntry(operator, date, time, callsign, frequency, mode, sentReport, receivedReport);
        logForm.reset();
        setDefaultDateTime();
    });
    
    function setDefaultDateTime() {
        const now = new Date();
        const utcDate = now.toISOString().substring(0, 10);
        const utcTime = now.toISOString().substring(11, 16);
        document.getElementById('date').value = utcDate;
        document.getElementById('time').value = utcTime;
    }

    function addLogEntry(operator, date, time, callsign, frequency, mode, sentReport, receivedReport) {
        const logEntry = { operator, date, time, callsign, frequency, mode, sentReport, receivedReport };
        let logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries.push(logEntry);
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
        appendLogEntryToTable(logEntry);
    }

    function appendLogEntryToTable(logEntry) {
        const row = logTableBody.insertRow();
        row.insertCell(0).textContent = logEntry.operator;
        row.insertCell(1).textContent = logEntry.date;
        row.insertCell(2).textContent = logEntry.time;
        row.insertCell(3).textContent = logEntry.callsign;
        row.insertCell(4).textContent = logEntry.frequency;
        row.insertCell(5).textContent = logEntry.mode;
        row.insertCell(6).textContent = logEntry.sentReport;
        row.insertCell(7).textContent = logEntry.receivedReport;
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

        let csvContent = "data:text/csv;charset=utf-8,Operatör,Datum,Tid (UTC),Callsign,Frekvens,Mode,Skickad signalrapport,Mottagen signalrapport\n";
        logEntries.forEach(entry => {
            const row = `${entry.operator},${entry.date},${entry.time},${entry.callsign},${entry.frequency},${entry.mode},${entry.sentReport},${entry.receivedReport}`;
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

    function exportToADIF() {
        const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        if (logEntries.length === 0) {
            alert("Ingen loggdata att exportera");
            return;
        }

        let adifContent = "data:text/plain;charset=utf-8:";
        logEntries.forEach(entry => {
            const adifEntry = `<QSO_DATE:${entry.date.length}>${entry.date} <TIME_ON:${entry.time.length}>${entry.time} <CALL:${entry.callsign.length}>${entry.callsign} <BAND:${entry.frequency.length}>${entry.frequency} <MODE:${entry.mode.length}>${entry.mode} <RST_SENT:${entry.sentReport.length}>${entry.sentReport} <RST_RCVD:${entry.receivedReport.length}>${entry.receivedReport} <EOR>\n`;
            adifContent += adifEntry;
        });

        const encodedUri = encodeURI(adifContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "radio_log.adif");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    saveButton.addEventListener('click', saveToCSV);
    exportAdifButton.addEventListener('click', exportToADIF);
    loadLogEntries();
});
