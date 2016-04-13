//reply to post

var message = "";
var replybutton = "<br><button class='btn btn-default btn-xs reply'>Reply</button>";

$(document).ready(function() {
	sendreply();
})

var sendreply = function() {
	$(".reply").click(function() {
		$(this).replaceWith("<div><textarea class='form-control message' type='text' name='email_body' placeholder='Message'></textarea><br><button class='btn btn-default btn-xs sendreply' type='submit'>Send Reply</button></div>"); 


	$(".sendreply").click(function() {
		message = $(this).parent().children(".message").val();
		var time = new Date();
		var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
		$(this).parent().replaceWith("<div><br>Bernd Huber at " + responsetime + ":<br>\"" + message + "\"<br></div>" + replybutton); 

		sendreply();
	});

	});
}