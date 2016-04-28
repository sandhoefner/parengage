// JSON storing all posts and replies

var messages = {
	posts : 
	[
		{
			"noteNumber" : 0,
			"person" : "Gajos",
			"target" : "You",
			"subject" : "Jeff's Last Exam",
			"date" : "4/16/2016 at 9:52",
			"message" : "Jeff did very well on the last exam!",
			"replies" : []
		},
		{
			"noteNumber" : 1,
			"person": "Bernd",
			"target" : "You",
			"subject" : "Back to School Night",
			"date" : "4/15/2016 at 6:40",
			"message" : "Here is a rundown on what happened at back to school night. I gave out a syllabus.",
			"replies" : [
				{
					"replyNumber" : 1,
					"person" : "You", 
					"date" : "4/27/2016 at 15:48",
					"message" : "Thanks so much Bernd!"
				}
			]
		}
	]
}

//reply to post

var message = "";
var teacher = "";
var messagebutton = " <button class='btn btn-info btn-m newmessage' id='new'>New Message</button><br>";

$(document).ready(function() {
	loadMessages();
	writemessage();
	displayMessages();
	sendreply();
});

function writemessage() {
	$(".newmessage").click(function() {
		$(this).replaceWith("<div class='newMessageDiv'><select class='form-control teacher_select' id='teacher_select'>\
          <option value=''>Select a teacher!</option>\
          <option value='Bernd'>Bernd</option>\
          <option value='Gajos'>Gajos</option>\
          <option value='King'>King</option>\
          <option value='Shapiro'>Shapiro</option>\
          <option value='Wang'>Wang</option>\
          <option value='Sandhoefner'>Sandhoefner</option>\
        </select>\
        <br>\
        <input class='form-control newmessagesubject' type='text' name='subject' placeholder='Subject'></input>\
        <br>\
        <textarea class='form-control newmessagetext' type='text' name='email_body' placeholder='Message'></textarea>\
        <br>\
        <button class='btn btn-info writemessage' type='submit' id='send_email'>Send</button></div>"); 


		$(".writemessage").click(function() 
		{
			message = $(this).parent().children(".newmessagetext").val();
			subject = $(this).parent().children(".newmessagesubject").val();
			teacher = $(this).parent().children(".teacher_select").val();

			// Form validation

			// Destroy previous error Divs and remove any error highlighting
			$(".error").remove();
			$(this).parent().children().removeClass("alert-danger");

			if (message == "") {
				appendErrorDiv("You need to type a message");
				$(".newmessagetext").addClass("alert-danger");
				
			} 
			else if (subject == "") 
			{
				appendErrorDiv("Please include a subject for your message");
				$(".newmessagesubject").addClass("alert-danger");
			}
			else if (teacher == "") 
			{
				appendErrorDiv("Please select a teacher");
				$(".teacher_select").addClass("alert-danger");
			}
			else 
			{
			var time = new Date();
			var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' at ' + time.getHours() + ':' + time.getMinutes();
			$(this).parent().remove();
			// $(this).parent().replaceWith(messagebutton + "<br></br><h4>"+responsetime+"</h4><br>"+ "<div><br> You writing to " + teacher + " at " + responsetime + ":<br>\"" + message + "\"<br></div>"); 

			// Add new note to JSON
			messages["posts"].push({
				"noteNumber" : messages["posts"].length,
				"person" : "You",
				"target" : teacher,
				"subject" : subject,
				"date" : responsetime,
				"message" : message,
				"replies" : []
			})
			console.log(messages);
			saveToLocalStorage();
			clearMessages();
			$("#content h1:first-child").after(messagebutton);
			displayMessages();

			// Callack: Allow for new message and reply functionality to work after new messages populate
			writemessage();
			sendreply();
			}
		});

	});
}


	// Load messages from localStorage or use default ones
function loadMessages() {
	if (localStorage.getItem("messages"))
	{
		console.log("hey!")
		console.log(localStorage.getItem("messages"))
		messages = JSON.parse(localStorage.getItem("messages"));
		console.log(messages);
	}
	else 
	{
	}
}

// Display all the messages that are stored in the messages array
var displayMessages = function() {
	for (i = messages["posts"].length - 1; i >= 0; i--) {
		html = "<div class='message message" + messages["posts"][i]["noteNumber"] + "' index='" + messages["posts"][i]["noteNumber"] + "'>";
		html += "<div>"
		html += "<h4>" + messages["posts"][i]["subject"] + "</h4>";
		html += "<p><i>"+ messages["posts"][i]["date"] + " from " + messages["posts"][i]["person"] + " to " + messages["posts"][i]["target"] + "</i></p>"
		html += "<p>" + messages["posts"][i]["message"] + "</p>";
		html += "</div>"

		// Add any replies underneath the reply
		for (j = 0; j < messages["posts"][i]["replies"].length; j++) {
			html += "<div class='replyMessage' index='" + j + "'>";
			html += "<p style='color: gray'><i>Posted by " + messages["posts"][i]["replies"][j]["person"] + " at " + messages["posts"][i]["replies"][j]["date"] + " </i></p> ";
			html += "<p>" + messages["posts"][i]["replies"][j]["message"];
			html += "</div>";
			// $("div[index='" + i "']").append(html);
			// $(".message" + messages["posts"][i]["noteNumber"]).append(html);
		}

		html += "<button class='btn btn-info btn-xs reply'>Reply</button><br>";
		html += "</div>";
		$(".messagesDiv").append(html);

	}
}

var clearMessages = function() {
	$(".messagesDiv").empty();
}

var sendreply = function() {

	var replybutton = "<br><button class='btn btn-info btn-xs reply'>Reply</button>";

	// Replace reply button with input text
	$(".reply").click(function() {
		$(this).replaceWith("<div><textarea class='form-control message' type='text' name='email_body' placeholder='Message'></textarea><br><button class='btn btn-info btn-xs sendreply' type='submit'>Send Reply</button></div>"); 

		// When they click reply
		$(".sendreply").click(function() {
			message = $(this).parent().children(".message").val();
			var time = new Date();
			var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
			
			// Save into JSON
			index = $(this).parent().parent().attr("index");
			messages["posts"][index]["replies"].push({
				"replyNumber" : messages["posts"][index]["replies"].length,
				"person" : "You",
				"date" : time.getMonth()+1 + '/' + time.getDate() + '/' + time.getFullYear() + ' at ' + time.getHours() + ':' + time.getMinutes(),
				"message" : message,
			})
			saveToLocalStorage();
			console.log(messages);

			// Remove the sendreply button and replace with the contents that user inputted
			newReplyhtml = "<div class='replyMessage' index='" +  messages["posts"][index]["replies"].length + "'>";
			newReplyhtml += "<p style='color: gray'><i>Posted by You at " + responsetime + " </i></p> ";
			newReplyhtml += "<p>" + message + "</p>";
			newReplyhtml += "</div>";

			$(this).parent().replaceWith(newReplyhtml); 

			sendreply();
		});
	});
}

// Save messages JSON into localStorage
var saveToLocalStorage = function() {
	localStorage.setItem("messages", JSON.stringify(messages));
}

// Instantiate error Div
var appendErrorDiv = function(errorText) {
	html = "<div class='alert alert-danger error' role='alert'>"
	html += '<span class="glyphicon glyphicon-exclamation-sign" style="font-size: 15px" aria-hidden="true"></span>'
	html += errorText + "</div>";
	$(".newMessageDiv").prepend(html);
}





var teachers_array = ['Bernd', "Gajos", "King", "Shapiro", "Wang", "Sandhoefner"];
var hash = window.location.hash.substring(1);
index = $.inArray(hash, teachers_array);
if (index !== -1) {
  	// need to prep message for teacher
  	console.log(hash);
}