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
					"message" : "Thanks so much Bernd!"
				}
			]
		}
	]
}

//reply to post

var message = "";
var teacher = "";
var messagebutton = " <button class='btn btn-info btn-m newmessage'>New Message</button><br>";

$(document).ready(function() {
	// loadMessages();
	writemessage();
	displayMessages();
	sendreply();
})

var writemessage = function() {
	$(".newmessage").click(function() {
		$(this).replaceWith("<div class='newMessageDiv'><select class='form-control teacher_select' id='teacher_select'>\
          <option value='dummy'>Select a teacher!</option>\
          <option value='Bernd'>Bernd</option>\
          <option value='Gajos'>Gajos</option>\
          <option value='King'>King</option>\
          <option value='Panda'>Panda</option>\
        </select>\
        <br>\
        <input class='form-control newmessagesubject' type='text' name='subject' placeholder='Subject'></input>\
        <br>\
        <textarea class='form-control newmessagetext' type='text' name='email_body' placeholder='Message'></textarea>\
        <br>\
        <button class='btn btn-info writemessage' type='submit' id='send_email'>Send</button></div>"); 


		$(".writemessage").click(function() {
			message = $(this).parent().children(".newmessagetext").val();
			subject = $(this).parent().children(".newmessagesubject").val();
			teacher = $(this).parent().children(".teacher_select").val();
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

			// Allow for new message and reply functionality to work when new messages populate
			writemessage();
			sendreply();
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
		html = "<div class='message' index='" + messages["posts"][i]["noteNumber"] + "'>";
		html += "<h4>" + messages["posts"][i]["subject"] + "</h4>";
		html += "<p><i>"+ messages["posts"][i]["date"] + " from " + messages["posts"][i]["person"] + " to " + messages["posts"][i]["target"] + "</i></p>"
		html += "<p>" + messages["posts"][i]["message"] + "</p>";
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
			messages[index]["replies"].push({
				"replyNumber" : messages["posts"][index]["replies"].length,
				"person" : "You",
				"date" : time.getMonth()+1 + '/' + time.getDate() + '/' + time.getFullYear() + ' at ' + time.getHours() + ':' + time.getMinutes(),
				"message" : message,
			})
			saveToLocalStorage();
			console.log(messages);

			// Remove the sendreply button
			$(this).parent().replaceWith("<div><br>You at " + responsetime + ":<br>\"" + message + "\"<br></div>" + replybutton); 

			sendreply();
		});
	});
}

var addMessage = function() {


}

var saveToLocalStorage = function() {
	localStorage.setItem("messages", messages);
}