$(document).ready(function(){
	$(".addNotification").click(function(){
		addCollegeForm();
		$(".addNotification").hide();
		$(".completeNotification").click(function(){
			console.log($(".taskName").val());
			saveForm();
		})
	})
	/*
	$(function() {
    	$( "#datepicker" ).datepicker();
  	});*/
})

/*
*
* addTaskForm creates the form DOM elements where admin can add a new task 
* 
*/
// Increments up every time a task is created. Would be later be taken from JSON

taskNumber = 2;
var addCollegeForm = function() {

	html = '<div class="collegeInput">';
	html += '<h4>Add New Task</h4>'
	html += '<input class="form-control taskName" type="text" name="email_subject" placeholder="Notification Name"><br>';
	html += '<textarea class="form-control taskDetails" type="text" name="email_body" placeholder="Notification Details"></textarea><br>'
	html += '<button class="btn btn-default completeNotification" type="submit" id="send_email">Add Task</button>'
    html += '</div>'
    $(".taskWrapper").prepend(html);
}

/* saveForm grabs the values of the form created from addTaskForm
Shoudl be trigged when admin hits "Add Task"*/

var saveForm = function () {
	taskName = $(".taskName").val();
	taskDetails = $(".taskDetails").val();

	// Create html and append
	html = '<div class="task" id="task' + taskNumber + '">';
	html += '<h3>' + taskName + '</h3>';
	html += '<p>' + taskDetails + '</p>';
	html += '</div>';

	$(".taskWrapper").prepend(html);

	// Hide the taskInput Form now that you're done and re-add the Add Task Button
	$(".collegeInput").hide();
	$(".addNotification").show();

	taskNumber += 1;
}


