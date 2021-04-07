var url = "http://sandbox.gibm.ch/berufe.php";
moment.locale("de");
let iCWeek = moment().week();
let iYear = moment().year();
let iProfessionID, iClassID;
let fMessage;

$(document).ready(function () {
    setSettings();
    $.getJSON(url)
        .done(function (data) {
            $.each(data, function () {
                $("#berufe").append($("<option></option>").val(this['beruf_id']).html(this['beruf_name']));
            });

            if (iProfessionID != "null" && iClassID != "null") {
                $('#berufe').val(iProfessionID).change();
                setWeek(0);
            }
            else {
                $("#berufe").append($("<option selected>Beruf auswählen</option>"));
                $("#class").hide();
                $("#lblClass").hide();
                $("#btnRow").hide();
            }
        })

        .fail(function () {
            fMessage = "Berufe können nicht gelanden werden!";
        })
});

function getKlasse() {
    localStorage.setItem("gibm_ProfessionID", $("#berufe").val());
    loadClasses($("#berufe").val());
}

function setStundenplan() {
    localStorage.setItem("gibm_ClassID", $("#class").val());
    iCWeek = moment().week();
    setWeek(0);
    getStundenplan($("#class").val());
}

function getStundenplan(classID) {
    var url3 = "http://sandbox.gibm.ch/tafel.php?klasse_id=" + classID + "&woche=" + iCWeek + "-" +iYear;
    var table = "";

    $.getJSON(url3)
        .done(function (data) {
            if (data.length > 2) {
                table += "<table class='table'><th scope='col'>Datum</th><th scope='col'>Wochentag</th><th scope='col'>Von-Bis</th><th scope='col'>Fach</th><th scope='col'>Lehrer</th><th scope='col'>Zimmer</th>";
                $.each(data, function () {
                    table += "<tr scope='row'>"
                    table += "<td>" + moment(this['tafel_datum']).format("DD-MM-YYYY") + "</td>";
                    table += "<td>" + moment(this['tafel_datum']).format('dddd') + "</td>";
                    table += "<td>" + "Von " + this['tafel_von'] + " bis " + this['tafel_bis'] + "</td>";
                    table += "<td>" + this['tafel_longfach'] + "</td>";
                    table += "<td>" + this['tafel_lehrer'] + "</td>";
                    table += "<td>" + this['tafel_raum'] + "</td>";
                    table += "</tr>";
                });
                table += "</table>";
            }

            else {
                table += "Ferien";
            }
            $("#stundenplanOutput").empty().append(table).fadeIn("2");
        })

        .fail(function () {
            fMessage = "Stundenplan kann nicht gelanden werden!";
            displayError();
        })
}

function setWeek(count) {
    $("#stundenplanOutput").fadeOut("1", function () {
        iCWeek = iCWeek + count;
        setSettings();
        getStundenplan(iClassID);
        // var mo = moment();
        // var test = moment().day("Montag").week(iCWeek);
        // var test2 = moment().week(iCWeek + 1).day('Sonntag');
        // console.log(moment(test).format("YYYY-MM-DD"), test2.toString());

        $("#weekDate").empty().append(iCWeek + "-" + iYear);
    });

}

function setSettings() {
    iProfessionID = localStorage.getItem("gibm_ProfessionID");
    iClassID = localStorage.getItem("gibm_ClassID");
}

function loadClasses(beruf_id) {
    $("#class").empty().append('<option value="0" selected="selected">Klasse auswählen</option>');
    var url2 = "http://sandbox.gibm.ch/klassen.php?beruf_id=" + beruf_id;
    $.getJSON(url2)
        .done(function (data) {
            $.each(data, function () {
                $("#class").append($("<option></option>").val(this['klasse_id']).html(this['klasse_longname']));
            });

            if (iClassID != "null") {
                $('#class').val(iClassID).change();
            }

            $("#stundenplanOutput").empty();
            $("#class").focus();
            $("#lblClass").show();
            $("#btnRow").show();
            $("#class").show("2000");
        })

        .fail(function () {
            fMessage = "Klassen können nicht gelanden werden!";
        })
}

function displayError()
{
    $("#lblErrorMessage").empty().append(fMessage);
    var myModal = new bootstrap.Modal(document.getElementById('modal'));
    myModal.show();
}