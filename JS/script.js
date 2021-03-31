var url = "http://sandbox.gibm.ch/berufe.php";
        moment.locale("de");
        let iCWeek = moment().week();
        let iProfessionID, iClassID;

        $( document ).ready(function()
        {
            setSettings();
            $("#berufe").append($("<option>Beruf auswählen</option>"));
        $.getJSON(url)
            .done(function (data) {
                $.each(data, function () {
                    $("#berufe").append($("<option></option>").val(this['beruf_id']).html(this['beruf_name']));
                });
                if(iProfessionID != "null")
                {

                    $('#berufe').val(iProfessionID).change();
                }
            })

            .fail(function () {
                console.log("Fail");
            })
            
        });

        function getKlasse() 
        {
            localStorage.setItem("gibm_ProfessionID", $("#berufe").val());
            loadClasses($("#berufe").val());
            $('#class').val(iClassID).change();
        }

        function setStundenplan()
        {
            localStorage.setItem("gibm_ClassID", $("#class").val());
            getStundenplan($("#class").val());
        }

        function getStundenplan(classID) {
            var url3 = "http://sandbox.gibm.ch/tafel.php?klasse_id=" + classID + "&woche=" + iCWeek + "-2021";
            var table = "";
            $.getJSON(url3)
                .done(function (data) {
                    table += "<table class='table'><th scope='col'>Datum</th><th scope='col'>Wochentag</th><th scope='col'>Von-Bis</th><th scope='col'>Fach</th><th scope='col'>Lehrer</th><th scope='col'>Zimmer</th>";
                    $.each(data, function () {
                        var dt = moment(this['tafel_datum'], "YYYY-MM-DD HH:mm:ss")
                        table += "<tr scope='row'>"
                        table += "<td>" + this['tafel_datum'] + "</td>";
                        table += "<td>" + dt.format('dddd') + "</td>";
                        table += "<td>" + "Von " + this['tafel_von'] + " bis " + this['tafel_bis'] + "</td>";
                        table += "<td>" + this['tafel_longfach'] + "</td>";
                        table += "<td>" + this['tafel_lehrer'] + "</td>";
                        table += "<td>" + this['tafel_raum'] + "</td>";
                        table += "</tr>";
                    });
                    table += "</table>";
                    $("#stundenplanOutput").empty().append(table);
                })

                .fail(function () {
                    console.log("Fail");
                })
        }

        function setWeek(count)
        {
            iCWeek = iCWeek + count;
            setSettings();
            getStundenplan(iClassID);
        }

        function setSettings()
        {
            iProfessionID = localStorage.getItem("gibm_ProfessionID");
            iClassID = localStorage.getItem("gibm_ClassID");
        }

        function loadClasses(beruf_id)
        {
            $("#class").empty().append('<option value="0" selected="selected">Klasse auswählen</option>');
            var url2 = "http://sandbox.gibm.ch/klassen.php?beruf_id=" + beruf_id;
            $.getJSON(url2)
                .done(function (data) {
                    $.each(data, function () {
                        $("#class").append($("<option></option>").val(this['klasse_id']).html(this['klasse_longname']));
                    });
                    
                    if(iClassID != "null")
                    {
                        $('#class').val(iClassID).change();
                    }
                })

                .fail(function () {
                    console.log("Fail");
                })
        }