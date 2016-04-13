
//send help message

$(document).ready(function() {
	$(".help").click(function() {
		$(this).parent().replaceWith("<div>Thanks for the message! Mrs. Johnson will respond as soon as possible.</div><br><a class='btn btn-default btn-xs' href='help.html' >New Message</a>"); 

});

});


