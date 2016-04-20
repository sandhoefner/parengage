//reply to post

var message = "";
var teacher = "";
var messagebutton = " <button class='btn btn-default btn-m newmessage'>New Message</button><br>";

$(document).ready(function() {
	writemessage();
})

var writemessage = function() {
	$(".newmessage").click(function() {
		$(this).replaceWith("<div><select class='form-control teacher_select' id='teacher_select'>\
          <option value='dummy'>Select a teacher!</option>\
          <option value='Bernd'>Bernd</option>\
          <option value='Gajos'>Gajos</option>\
          <option value='King'>King</option>\
          <option value='Panda'>Panda</option>\
        </select>\
        <br>\
        <textarea class='form-control newmessagetext' type='text' name='email_body' placeholder='Message'></textarea>\
        <br>\
        <button class='btn btn-default writemessage' type='submit' id='send_email'>Send</button></div>"); 


	$(".writemessage").click(function() {
		message = $(this).parent().children(".newmessagetext").val();
		teacher = $(this).parent().children(".teacher_select").val();
		var time = new Date();
		var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
		$(this).parent().replaceWith(messagebutton + "<br></br><h4>"+responsetime+"</h4><br>"+ "<div><br> You writing to " + teacher + " at " + responsetime + ":<br>\"" + message + "\"<br></div>"); 

		writemessage();
	});

	});
}