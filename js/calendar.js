// Refer to the JavaScript quickstart on how to setup the environment:
// https://developers.google.com/google-apps/calendar/quickstart/js
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.

if (!localStorage["events"]) {
        events = ["Buy chalk", "Go to the gym", "Dinner with Kevin", "Unpack", "Reading"];
    // returning user
    } else {
        events = JSON.parse(localStorage["events"]);
    }

    // make "enter" work to submit form
    $(document).ready(function() {
        $('#note').keypress(function(e) {
            if (e.keyCode == 13) {
                $('#submit').click();
            }
        });
    });

    // create note
    function goo(text, init) {
        document.getElementById('note').value = "";
        var new_note = document.createElement("div");
        new_note.innerText = text;
        new_note.style.top = topp;
        new_note.className = "all_events";
        new_note.style.left = left;
        new_note.style.cursor = "pointer";
        new_note.setAttribute("onclick", "trash(this);this.remove();");
        document.getElementsByTagName('body')[0].appendChild(new_note);
        if (left == 950) {
            left = 50;
            topp += 150;
        } else {
            left += 150;
        }
        if (!init) {
            events.push(text);
        }
        localStorage["events"] = JSON.stringify(events);
    }

    // remove note from memory
    function trash(it) {
        for (var i = 0; i < events.length; i++) {
            if (events[i] == it.innerText) {
                events.splice(i, 1);
                localStorage["events"] = JSON.stringify(events);
                break;
            }
        }
    }

    function save(){
              var form = document.getElementById("xml_form");
              form.elements.data.value = scheduler.toXML();
              form.submit();
          }

request.execute(function(event) {
});