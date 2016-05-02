// JSON storing all posts and replies

var forumMessages = {
	posts : 
	[
		{
			"noteNumber" : 0,
			"subject" : "Carpooling this week",
			"person" : "Jennifer Viles",
			"date" : "4/15/2016 at 10:22",
			"message" : "Can anyone help my son carpool to the basketball game? It's a busy week at...",
			"replies" : []
		},
		{
			"noteNumber" : 1,
			"subject" : "Contacting Mr. Bernd",
			"person" : "Pam Sanders",
			"date" : "4/20/2016 at 6:40",
			"message" : "Is anyone else having trouble getting Mr. Bernd to respond to emails? I tried talking to the...",
			"replies" : [
				{
					"replyNumber" : 1,
					"person" : "Rob Smith", 
					"date" : "4/27/2016 at 15:48",
					"message" : "I'm also having trouble, who should we reach out to?"
				}
			]
		}
	]
}

//reply to post

var message = "";
var teacher = "";
var messagebutton = " <button class='btn btn-info btn-m newmessage' id='new'>New Discussion</button>";

$(document).ready(function() {
	loadMessages();
	writemessage();
	displayMessages();
	sendreply();
});

function writemessage() {
	$(".newmessage").click(function() {
		$(this).replaceWith("<div class='newMessageDiv'>\
		<input class='form-control newmessagesubject' type='text' name='subject' placeholder='Subject'></input>\
		<br>\
		<textarea class='form-control newmessagetext' type='text' name='email_body' placeholder='Message'></textarea>\
        <br>\
        <button class='btn btn-info writemessage' type='submit' id='send_email'>Send</button></div>"); 


		$(".writemessage").click(function() 
		{
			var message = $(this).parent().children(".newmessagetext").val();
			var subject = $(this).parent().children(".newmessagesubject").val();
			// Form validation
			// Destroy previous error Divs and remove any error highlighting
			$(".error").remove();
			$(this).parent().children().removeClass("alert-danger");

			if (message == "") {
				appendErrorDiv("You need to type a message");
				$(".newmessagetext").addClass("alert-danger");
				
			}
			else 
			{
			var user = JSON.parse(localStorage.getItem("userData"));
			user = user["firstName"] + " " + user["lastName"];
			var time = new Date();
			var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' at ' + time.getHours() + ':' + time.getMinutes();
			$(this).parent().remove();
			// $(this).parent().replaceWith(messagebutton + "<br></br><h4>"+responsetime+"</h4><br>"+ "<div><br> You writing to " + teacher + " at " + responsetime + ":<br>\"" + message + "\"<br></div>"); 

			// Add new note to JSON
			forumMessages["posts"].push({
				"noteNumber" : forumMessages["posts"].length,
				"subject" : subject,
				"person" : user,
				"date" : responsetime,
				"message" : message,
				"replies" : []
			})
			console.log(forumMessages);
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
	if (localStorage.getItem("forumMessages"))
	{
		console.log(localStorage.getItem("forumMessages"))
		forumMessages = JSON.parse(localStorage.getItem("forumMessages"));
		console.log(forumMessages);
	}
	else 
	{
	}
}

// Display all the messages that are stored in the messages array
var displayMessages = function() {
	for (i = forumMessages["posts"].length - 1; i >= 0; i--) {
		html = "<div class='message message" + forumMessages["posts"][i]["noteNumber"] + "' index='" + forumMessages["posts"][i]["noteNumber"] + "'>";
		html += "<div>"
		html += "<h3>" + forumMessages["posts"][i]["subject"] + "</h3>";
		html += "<h4>"+ forumMessages["posts"][i]["date"] + " from " + forumMessages["posts"][i]["person"]+ "</h4>"
		html += "<p>" + forumMessages["posts"][i]["message"] + "</p>";
		html += "</div>"

		// Add any replies underneath the reply
		for (j = 0; j < forumMessages["posts"][i]["replies"].length; j++) {
			html += "<div class='replyMessage' index='" + j + "'>";
			html += "<p style='color: gray'><i><b>Posted by " + forumMessages["posts"][i]["replies"][j]["person"] + " at " + forumMessages["posts"][i]["replies"][j]["date"] + " </b></i></p> ";
			html += "<p>" + forumMessages["posts"][i]["replies"][j]["message"];
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

	var replybutton = "<button class='btn btn-info btn-xs reply'>Reply</button>";

	// Replace reply button with input text
	$(".reply").click(function() {
		$(this).replaceWith("<div><textarea style='background-color: white' class='form-control message' type='text' name='email_body' placeholder='Message'></textarea><br><button class='btn btn-info btn-xs sendreply' type='submit'>Send Reply</button></div>"); 

		// When they click reply
		$(".sendreply").click(function() {
			// Grab key variables
			message = $(this).parent().children(".message").val();
			var time = new Date();
			var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
			var user = JSON.parse(localStorage.getItem("userData"));
			user = user["firstName"] + " " + user["lastName"];

			// Save into JSON

			index = $(this).parent().parent().attr("index");
			forumMessages["posts"][index]["replies"].push({
				"replyNumber" : forumMessages["posts"][index]["replies"].length,
				"person" : user,
				"date" : time.getMonth()+1 + '/' + time.getDate() + '/' + time.getFullYear() + ' at ' + time.getHours() + ':' + time.getMinutes(),
				"message" : message,
			})
			saveToLocalStorage();
			console.log(forumMessages);

			// Remove the sendreply button and replace with the contents that user inputted
			newReplyhtml = "<div class='replyMessage' index='" +  forumMessages["posts"][index]["replies"].length + "'>";
			newReplyhtml += "<p style='color: gray'><i><b>Posted by " + user + " at " + responsetime + " </b></i></p> ";
			newReplyhtml += "<p>" + message + "</p>";
			newReplyhtml += "</div>" + replybutton;

			$(this).parent().replaceWith(newReplyhtml); 

			sendreply();
		});
	});
}

// Save messages JSON into localStorage
var saveToLocalStorage = function() {
	localStorage.setItem("forumMessages", JSON.stringify(forumMessages));
}

// Instantiate error Div
var appendErrorDiv = function(errorText) {
	html = "<div class='alert alert-danger error' role='alert'>"
	html += '<span class="glyphicon glyphicon-exclamation-sign" style="font-size: 15px" aria-hidden="true"></span>'
	html += errorText + "</div>";
	$(".newMessageDiv").prepend(html);
}






