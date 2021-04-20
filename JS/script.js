// Setzt die Umgebung von Moment JS auf die Spache und Zeitzone von Deutschland
moment.locale("de");
// Variabel für die aktuelle Woche
let iCWeek = moment().week();
// Variable für das aktuelle Jahr
let iYear = moment().year();
// Variablen für Beruf ID und Klasse ID
let iProfessionID, iClassID;
// Variable für Fehlermeldung
let fMessage;

// Funktion, die erst ausgeführt wird, wenn alle HTML Elemente geladen werden
$(document).ready(function () {
    // URL für die Berufe
    var url = "http://sandbox.gibm.ch/berufe.php";
    // Methoden aufruf setSettings, wird gebraucht um die Variabeln iProfessionID und iClassID zu füllen
    setSettings();
    // Methode um das JSON von einer URL zu bekommen
    $.getJSON(url)
        // Methode die ausgeführt wird, wenn es keine Fehler gab
        .done(function (data) {
            // Foreach für jedes Element im JSON Response
            $.each(data, function () {
                // Fügt den Beruftext als Text in das Dropdown und die Berufs_ID als Value im Dropdown
                $("#berufe").append($("<option></option>").val(this['beruf_id']).html(this['beruf_name']));
            });

            // Überprüfung ob die ob die Variablen einen Wert besitzen
            if (iProfessionID != "null" && iClassID != "null") {
                // Wenn ja setzt es die Value als ausgewählter Beruf im Dropdown
                $('#berufe').val(iProfessionID).change();
                // Methode wird aufgerufen für die aktuelle Woche
                setWeek(0);
            }
            else {
                // Wenn nicht wird als erste Value Beruf auswählen ausgewählt
                $("#berufe").append($("<option selected>Beruf auswählen</option>"));
                // Versteckt das Dropdown für die Klassen
                $("#class").hide();
                // Versteckt das Label für die Klassen
                $("#lblClass").hide();
                // Versteckt die Buttons für die Wochen
                $("#btnRow").hide();
            }
        })
        // Methode die ausgeführt wird, wenn ein Fehler passiert, z.B. die URL nicht existiert oder einen anderen Wert zurückgibt
        .fail(function () {
            // Fehlermeldung
            fMessage = "Berufe können nicht gelanden werden!";
            // Ruft das Modalpanel auf mit der Fehlermeldung
            displayError();
        })
});

//Wird ausgeführt wenn im Dropdown der Beruf geändert wird
function getKlasse() {
    // Setzt im LocalStorage die Berufs ID
    localStorage.setItem("gibm_ProfessionID", $("#berufe").val());
    // Löscht die Value von der Klasse
    localStorage.removeItem("gibm_ClassID");
    // Ruft die Methode loadClasses mit dem Wert vom Dropdown der Berufe
    loadClasses($("#berufe").val());
}

// Wird aufgerufen, wenn im Dropdown die Klasse verändert wird
function setStundenplan() {
    // Setzt im LocalStorage die Klasse ID
    localStorage.setItem("gibm_ClassID", $("#class").val());
    // Setzt die KlasseID und BerufsID
    setSettings();
    // Setzt die Variable auf die aktuelle Woche
    iCWeek = moment().week();
    // Ruft die Methode SetWeek damit die Woche + Jahr angezeigt wird
    setWeek(0);
    // Ruft die Methode getStundenplan auf mit dem Wert der Klasse
    getStundenplan($("#class").val());
}

// Wird in der Methode setStundenplan aufgerufen und liesst den Stundenplan von der API und zeigt ihn dann an
function getStundenplan(classID) {
    $("#stundenplanOutput").fadeOut("1", function () {
        // Variable für die URL
        var url = "http://sandbox.gibm.ch/tafel.php?klasse_id=" + classID + "&woche=" + iCWeek + "-" + iYear;
        // Variable für die Tabelle
        var table = "";

        // Methode um das JSON von einer URL zu bekommen
        $.getJSON(url)
            // Methode die ausgeführt wird, wenn es keine Fehler gab
            .done(function (data) {
                // Überprüft ob die Response leer ist
                if (data.length > 2) {
                    // Erstellt den Header für den Stundenplan
                    table += "<table class='table'><th scope='col'>Datum</th><th scope='col'>Wochentag</th><th scope='col'>Von-Bis</th><th scope='col'>Fach</th><th scope='col'>Lehrer</th><th scope='col'>Zimmer</th>";
                    // Foreach für jedes Element im JSON Response
                    $.each(data, function () {
                        // Erstellt eine neue Zeile
                        table += "<tr scope='row'>"
                        // Erstellt eine Spalte mit dem Datum mit dem Format DD-MM-YYYY
                        table += "<td>" + moment(this['tafel_datum']).format("DD-MM-YYYY") + "</td>";
                        // Erstellt eine Spalte mit dem Wochentagname
                        table += "<td>" + moment(this['tafel_datum']).format('dddd') + "</td>";
                        // Erstellt eine Spalte mit von bis mit dem Format
                        // Datum + Zeit gebraucht zum Formatieren ohne Sekunden
                        table += "<td>" + "Von " + moment(this['tafel_datum'] + ' ' + this['tafel_von']).format('HH:mm') + " bis " + moment(this['tafel_datum'] + ' ' + this['tafel_bis']).format("HH:mm") + "</td>";
                        // Erstellt eine Spalte mit dem Fachname
                        table += "<td>" + this['tafel_longfach'] + "</td>";
                        // Erstellt eine Spalte mit dem Name des Lehrers
                        table += "<td>" + this['tafel_lehrer'] + "</td>";
                        // Erstellt eine Spalte für die Zimmer Nr
                        table += "<td>" + this['tafel_raum'] + "</td>";
                        // Schliesst die Zeile
                        table += "</tr>";
                    });
                    // Schliesst die Tabelle
                    table += "</table>";
                }
                //Wenn die Response leer ist 
                else {
                    // Gibt aus, dass diese Woche kein Unterricht stattfindet
                    table += "<div class = 'alert alert-warning' > Kein Unterricht in dieser Woche</div>";
                }

                // Füllt das div mit dem Stundenplan mit einem FadeIn Effekt
                $("#stundenplanOutput").empty().append(table).fadeIn("2");
            })
            // Methode die ausgeführt wird, wenn ein Fehler passiert, z.B. die URL nicht existiert oder einen anderen Wert zurückgibt
            .fail(function () {
                // Fehlermeldung
                fMessage = "Stundenplan kann nicht gelanden werden!";
                // Ruft das Modalpanel auf mit der Fehlermeldung
                displayError();
            })
    });

}
// Methode setWeek switcht die Woche mit dem Parameter von einem Button
function setWeek(count) {
    // Setzt die neue Woche
    iCWeek = iCWeek + count;

    // Lädt den Stundenplan mit der ClassID
    getStundenplan(iClassID);

    //Zeigt die Woche und das Jahr an 
    $("#weekDate").empty().append(iCWeek + "-" + iYear);
}

function setSettings() {
    // Liest den LocalStorage mit den Keys und setzt es in die dementspechenenden Variablen
    iProfessionID = localStorage.getItem("gibm_ProfessionID");
    iClassID = localStorage.getItem("gibm_ClassID");
}

// Methode loadClasses mit dem Paramter für den Beruf, Lädt die Berufe und fügt sie dem Dropdown hinzu
function loadClasses(beruf_id) {
    // Löscht zuerst alle Klassen im Dropdown und fügt dann "Klasse auswählen" hinzu
    $("#class").empty().append('<option value="0" selected="selected">Klasse auswählen</option>');
    // URL für den API Call für die Klasse mit der Berufs ID
    var url = "http://sandbox.gibm.ch/klassen.php?beruf_id=" + beruf_id;

    // Methode um das JSON von einer URL zu bekommen
    $.getJSON(url)
        // Methode die ausgeführt wird, wenn es keine Fehler gab
        .done(function (data) {
            // Foreach für jedes Element im JSON Response
            $.each(data, function () {
                // Fügt im Dropdown den Klassenname als Anzeige und die dementsprechende Value hinzu
                $("#class").append($("<option></option>").val(this['klasse_id']).html(this['klasse_longname']));
            });

            //Wenn die Klasse im LocalStorage existiert, wird die Klasse im Dropdown ausgewählt
            if (iClassID != "null") {
                $('#class').val(iClassID).change();
            }
            // Versteckt den Stundenplan
            $("#stundenplanOutput").hide();
            // Leert den Stundenplan
            $("#stundenplanOutput").empty();
            // Setzt den Focus auf das Dropdown der Klasse
            $("#class").focus();
            // Zeigt das Label des Dropdowns an
            $("#lblClass").show();
            // Zeigt die Buttons der Woche an
            $("#btnRow").show();
            // Zeigt das Dropdown an
            $("#class").show();
        })
        // Methode die ausgeführt wird, wenn ein Fehler passiert, z.B. die URL nicht existiert oder einen anderen Wert zurückgibt
        .fail(function () {
            // Fehlermeldung
            fMessage = "Klassen können nicht gelanden werden!";
            // Ruft das Modalpanel auf mit der Fehlermeldung
            displayError();
        })
}

// Methode um das Errorpanel anzuzeigen
function displayError() {
    // Löscht zuerst die vohrige Fehlermeldung und ersetzt sie mit der neuen
    $("#lblErrorMessage").empty().append(fMessage);
    // Bekommt das Modal mit der ID
    var myModal = new bootstrap.Modal(document.getElementById('modal'));
    // Zeigt das Popup mit Hilfe von Bootstrap
    myModal.show();
}

// function dismissError() {
//     var myModal = new bootstrap.Modal(document.getElementById('modal'));
//     // Zeigt das Popup mit Hilfe von Bootstrap
//     myModal.hide();
// }