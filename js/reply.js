//reply to post

var message = "";
var replybutton = "<br><button class='btn btn-info btn-xs reply'>Reply</button>";
var newdiscussbutton = "<button class='btn btn-info btn-m newdiscussion'>New Discussion</button><br>";
var replies = [];
var discussions;
var replynum = 2;

$(document).ready(function() {
	if (localStorage.getItem('reply1')) {
			replies[1] = localStorage.getItem('reply1');
			var newstorage1 = localStorage.getItem('reply1');
			$("#replies1").html(newstorage1);
	}
	else {
		replies[1] = "";
		localStorage.setItem('reply1', replies[1]);
	}
	if (localStorage.getItem('reply2')) {
			replies[2] = localStorage.getItem('reply2');
			var newstorage2 = localStorage.getItem('reply2');
			$("#replies2").html(newstorage2);
	}
	else{
		replies[2] = "";
		localStorage.setItem('reply2', replies[2]);
	}
	if (localStorage.getItem('discussions')) {
			discussions = localStorage.getItem('discussions');
			var newstorage3 = localStorage.getItem('discussions');
			$("#discuss").html(newstorage3);
	}
	else{
		discussions = "";
		localStorage.setItem('discussions', discussions);
	}
	if (localStorage.getItem('replynum')) {
			replynum = localStorage.getItem('replynum');
	}
	else {
		localStorage.setItem('replynum', replynum);
	}

	for(var i = 0; replies[i] != ""; i++){
		if (localStorage.getItem('reply' + i)) {
			replies[i] = localStorage.getItem('reply' + i);
			var newstorage2 = localStorage.getItem('reply' + i);
			$("'#replies' + i").html(newstorage2);
		}
		else{
			replies[i] = "";
			localStorage.setItem('reply' + i, replies[i]);
		}
	}

	sendreply();
	//discussion();
});

var sendreply = function() {
	$(".newdiscussion").click(function() 
	{
 		$(this).replaceWith("<div><textarea class='form-control message' type='text' name='email_body' placeholder='Message'></textarea><br><button class='btn btn-info btn-xs sendmessage' type='submit'>Start Discussion</button></div>"); 
 		replynum = replynum + 1;

 		$(".sendmessage").click(function() 
 		{
 			message = $(this).parent().children(".message").val();
			var time = new Date();
			var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
			var replace =  "<div id= 'note" + replynum + "'><br><h4>You at " + responsetime + ":</h4><br>\"" + message + "\"<br>" + replybutton +"</div>";
		
			
			discussions += replace;
			localStorage.setItem('discussions', newdiscussbutton + discussions);
			

			$(this).parent().replaceWith(newdiscussbutton + replace); 

			sendreply();
	 	});

 	});


	$(".reply").click(function() 
	{
		$(this).replaceWith("<div><textarea class='form-control message' type='text' name='email_body' placeholder='Message'></textarea><br><button class='btn btn-info btn-xs sendreply' type='submit'>Send Reply</button></div>"); 


		$(".sendreply").click(function() 
		{
			message = $(this).parent().children(".message").val();
			var time = new Date();
			var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
			var replace = "<div><br>You at " + responsetime + ":<br>\"" + message + "\"<br></div>";
		
			console.log($(this).parent().parent().attr('id'));
			

			if ($(this).parent().parent().attr('id') == "note1") {
				replies[1] += replace;
				localStorage.setItem('reply1', replies[1]);
			}
			else if ($(this).parent().parent().attr('id') == "note2") {
				replies[2] += replace;
				localStorage.setItem('reply2', replies[2]);
			}
			else {
				replies[replynum] += replace;
				localStorage.setItem('reply' + replynum, replies[replynum]);
			}

			$(this).parent().replaceWith(replace  + replybutton); 

			sendreply();
		});


	});

	
};

// var discussion = function () {
// 	$(".newdiscussion").click(function() {
// 		$(this).replaceWith("<div><textarea class='form-control message' type='text' name='email_body' placeholder='Message'></textarea><br><button class='btn btn-info btn-xs sendmessage' type='submit'>Start Discussion</button></div>"); 


// 	$(".sendmessage").click(function() {
// 		message = $(this).parent().children(".message").val();
// 		var time = new Date();
// 		var responsetime= (time.getMonth()+1) + '/' + time.getDate() + '/' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes();
// 		var replace =  "<div><br><h4>You at " + responsetime + ":</h4><br>\"" + message + "\"<br></div>" + replybutton;
	
		
// 		discussions += replace;
// 		localStorage.setItem('discussions', discussions);
		

// 		$(this).parent().replaceWith(replace); 

// 	});

// 	});
// };