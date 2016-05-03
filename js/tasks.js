//
// creating a new task with the same name as an existing task will corrupt the existing one in memory
// non-unique checkbox IDs
// finishing last checkbox on task should delete it or put "finished!"
// select all
// edit fields
// debug
// etc
//
$(document).ready(function() {

    // document.onload = function() {
    // Increments up every time a task is created. Would be later be taken from JSON
    $(".addTask").click(function() {
            addTaskForm();
            $(".addTask").hide();
            $(".completeTask").click(function() {
                saveForm();
            })
        })
        /*
	$(function() {
    	$( "#datepicker" ).datepicker();
  	});*/


    /*
     *
     * addTaskForm creates the form DOM elements where admin can add a new task 
     * 
     */
    taskNumber = 1;
    var addTaskForm = function() {

        html = '<div class="taskInput">';
        html += '<h4>Add New Task</h4>'
        html += '<input class="form-control taskName" type="text" name="email_subject" placeholder="Task Name"><br>';
        html += '<input class="form-control taskDate" type="text" id="datepicker" placeholder="Description"><br>'
        html += '<textarea class="form-control taskDetails" type="text" name="email_body" placeholder="Checklist (press Enter between items)"></textarea><br>'
        html += '<button class="btn btn-info completeTask" type="submit" id="send_email">Add Task</button>'
        html += '</div>'
        $(".taskWrapper").prepend(html);

    }

    /* saveForm grabs the values of the form created from addTaskForm
    Should be trigged when admin hits "Add Task"*/

    var saveForm = function() {
        taskName = $(".taskName").val();
        taskDate = $(".taskDate").val();
        taskDetails = $(".taskDetails").val();

        // Create html and append
        html = '<div class="task" id="' + taskName + '">';
        html += '<h3>' + taskName + '</h3>';
        html += '<h5>' + taskDate + '</h5>';
        var split = taskDetails.split('\n');
        html += "<div class='checkbox'>";
        for (i = 0; i < split.length; i++) {
            html += '<input type="checkbox">' + split[i] + '</input><br>';
        }
        html += "</div>";
        html += '<p><a class="clickable btn btn-danger" onclick="dele(this.parentElement.parentElement);">Delete</a></p>';
        html += '</div>';

        // Add new summary line for Tasks if admin
        $('.listHeader').after('<li class="list-group-item">' + taskName + '<span class="badge">0 completed</span></li>');

        // Save into local storage
        keys.push(taskName);
        localStorage.keys = JSON.stringify(keys);
        split.unshift(taskDate);
        localStorage[taskName] = JSON.stringify(split);
        // console.log(split);
        // console.log(keys);


        $(".taskWrapper").prepend(html);

        // Hide the taskInput Form now that you're done and re-add the Add Task Button
        $(".taskInput").hide();
        $(".addTask").show();

        taskNumber += 1;

        // Notify parents that a new update has been made to tasks
        updateNotifications("Tasks");
    }

    var init = function(name, body, list) {
        // Create html and append
        html = '<div class="task" id="' + name + '">';
        html += '<h3>' + name + '</h3>';
        html += '<h5>' + body + '</h5>';
        html += "<div class='checkbox'>";
        for (i = 0; i < list.length; i++) {
            html += '<input type="checkbox">' + list[i] + '</input><br>';
        }
        html += "</div>";
        html += '<p><a class="clickable btn btn-danger" onclick="dele(this.parentElement.parentElement);">Delete</a></p>';
        html += '</div>';

        // var total_html = (html + document.getElementById("taskWrapper").innerHTML) || html;
        // document.getElementById("taskWrapper").innerHTML += html;
        // document.getElementById("taskWrapper").innerHTML = total_html;
        $(".taskWrapper").prepend(html);
        taskNumber += 1;
    }



    // first time user
    if (!localStorage["returning_user"]) {
        localStorage.returning_user = "1";
        console.log("new user");
        keys = ["Bake Sale!"];
        localStorage.keys = JSON.stringify(["Bake Sale!"]);
        localStorage["Bake Sale!"] = JSON.stringify(["If you have a moment, please call a few of these parents and ask them to volunteer for the bake sale! If you do call anyone, please check their box and press 'submit' so we don't call them again.", "Pam Davis: 555-555-5555", "Jim Clooney: 555-555-5555", "Martha Kim: 555-555-5555", "Lily Kerr: 555-555-5555"]);
        init("Bake Sale!", "If you have a moment, please call a few of these parents and ask them to volunteer for the bake sale! If you do call anyone, please check their box and press 'submit' so we don't call them again.", ["Pam Davis: 555-555-5555", "Jim Clooney: 555-555-5555", "Martha Kim: 555-555-5555", "Lily Kerr: 555-555-5555"]);
    } else {
        // returning user
        console.log("returning user");
        keys = JSON.parse(localStorage.keys);
        // console.log(keys);

        for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            // console.log(keys);
            var array = JSON.parse(localStorage[key]);
            var desc = array[0];
            array.shift();
            // console.log("key: " + key);
            // console.log("desc: " + desc);
            // console.log("array: " + array);
            init(key, desc, array);
            // console.log(keys.length);
        }
    }


    // If admin, then create and instantiate summary information
    if (localStorage.getItem("userData")) {
        var userData = JSON.parse(localStorage.getItem("userData"));
        if (isAdmin(userData)){
            instantiateAdminSummary(userData);
        } else {

        }
    }

    // // first time user
    //     if (!localStorage["tasks"]) {

    //         var tasks = "Bake Sale!", "If you have a moment, please call a few of these parents and ask them to volunteer for the bake sale! If you do call anyone, please check their box and press 'submit' so we don't call them again.", ["Pam Davis: 555-555-5555", "Jim Clooney: 555-555-5555", "Martha Kim: 555-555-5555", "Lily Kerr: 555-555-5555"]]];

    //         localStorage.tasks = tasks;
    //     // returning user
    // } else {
    // tasks = JSON.parse(localStorage["tasks"]);
    // }
});

// Function to create and instantiate summary of all tasks and parent participation
var instantiateAdminSummary = function(data) {
    // First grab number of tasks from keys in localStorage
    var tasks = JSON.parse(localStorage.getItem("keys"));
    // Create the proper divs based on tasks
    var adminSummaryDiv = '<div class="adminSummary">'
    adminSummaryDiv += '<h3>Tasks Participation Summary</h3>'
    adminSummaryDiv += '<ul class="adminSummary summaryTasks list-group">'
    adminSummaryDiv += '<li class="list-group-item active listHeader">Summary for Tasks</li>'

    // Loop through all the tasks created
    for (i= tasks.length - 1; i >= 0; i--) {
        var randomNumber = Math.floor((Math.random()*20) + 20)
        adminSummaryDiv += '<li class="list-group-item">' + tasks[i] + ' <span class="badge">' + randomNumber + ' completed</span></li>';
    }
    adminSummaryDiv += '</ul>';
    adminSummaryDiv += '</div>';
    $('h1').after(adminSummaryDiv);
}

function dele(elt) {
    taskNumber -= 1;

    // localStorage["tasks"] = JSON.stringify(tasks);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] == elt.id) {
            keys.splice(i, 1);
            localStorage["keys"] = JSON.stringify(keys);
            // console.log(keys);
            break;
        }
    }
    // localStorage.keys = keys;
    elt.remove();
}