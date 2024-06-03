document.addEventListener("DOMContentLoaded", function() {
    const logForm = document.getElementById('logForm');
    const logTableBody = document.getElementById('logTable').getElementsByTagName('tbody')[0];
    const saveButton = document.getElementById('saveButton');
    const exportAdifButton = document.getElementById('exportAdifButton');
    let editIndex = null;

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
        
        const logEntry = { operator, date, time, callsign, frequency, mode, sentReport, receivedReport };

        if (editIndex !== null) {
            updateLogEntry(editIndex, logEntry);
        } else {
            addLogEntry(logEntry);
        }

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

    function addLogEntry(logEntry) {
        let logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries.push(logEntry);
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
        appendLogEntryToTable(logEntry, logEntries.length - 1);
    }

    function updateLogEntry(index, logEntry) {
        let logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries[index] = logEntry;
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
        refreshLogTable();
        editIndex = null;
    }

    function deleteLogEntry(index) {
        let logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries.splice(index, 1);
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
        refreshLogTable();
    }

    function editLogEntry(index) {
        let logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        const logEntry = logEntries[index];
        document.getElementById('operator').value = logEntry.operator;
        document.getElementById('date').value = logEntry.date;
        document.getElementById('time').value = logEntry.time;
        document.getElementById('callsign').value = logEntry.callsign;
        document.getElementById('frequency').value = logEntry.frequency;
        document.getElementById('mode').value = logEntry.mode;
        document.getElementById('sentReport').value = logEntry.sentReport;
        document.getElementById('receivedReport').value = logEntry.receivedReport;
        editIndex = index;
    }

    function appendLogEntryToTable(logEntry, index) {
        const row = logTableBody.insertRow();
        row.insertCell(0).textContent = logEntry.operator;
        row.insertCell(1).textContent = logEntry.date;
        row.insertCell(2).textContent = logEntry.time;
        row.insertCell(3).textContent = logEntry.callsign;
        row.insertCell(4).textContent = logEntry.frequency;
        row.insertCell(5).textContent = logEntry.mode;
        row.insertCell(6).textContent = logEntry.sentReport;
        row.insertCell(7).textContent = logEntry.receivedReport;

        const actionsCell = row.insertCell(8);
        const editButton = document.createElement('button');
        editButton.textContent = 'Redigera';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => editLogEntry(index));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Ta bort';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => deleteLogEntry(index));
        actionsCell.appendChild(deleteButton);
    }

    function refreshLogTable() {
        logTableBody.innerHTML = '';
        loadLogEntries();
    }

    function loadLogEntries() {
        const logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
        logEntries.forEach((entry, index) => appendLogEntryToTable(entry, index));
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
