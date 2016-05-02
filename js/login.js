
$(document).ready(function(){
	// User will either be set to parent or admin based on radioButton
	user = "";
	$(".radioButton").click(function() {
		user = $(this).val();
	})

	// When user clicks login, check for errors...
	$("#loginButton").click(function() {
		// Destroy any previous errorDivs
		$(".error").remove();

		// Get values from login and password
		username = $(".username").val();
		password = $(".password").val();
		// Get which checkbox is checked


		$.getJSON("../login.json", function(data) {
			testData = data;
			//Parent case
			if (user == "parent") {
				for (i = 0; i < data["parents"].length; i++) {
					if (username == data["parents"][i]["username"] && password == data["parents"][i]["password"]) {
						localStorage.setItem("username", username);
						localStorage.setItem("password", password);
						// TODO: Hard coded for now to take the first parent data, but if more parents, 
						//then it should get the correct index
						localStorage.setItem("userData", JSON.stringify(data["parents"][0]))
						window.location.href = "../index.html";
					} else {
						appendErrorDiv("Sorry your username or password is incorrect!");
					}
				}
			}
			//Admin case
			else if (user == "admin") {
				for (i = 0; i < data["admin"].length; i++) {
					if (username == data["admin"][i]["username"] && password == data["admin"][i]["password"]) {
						localStorage.setItem("username", username);
						localStorage.setItem("password", password);
						localStorage.setItem("userData", JSON.stringify(data["admin"][0]))

						window.location.href = "../adminDashboard.html";
					} else {
						appendErrorDiv("Sorry your username or password is incorrect!");
					}
				}
			} 
			// User did not check a case
			else {
				appendErrorDiv("Please check whether you are an admin or parent.");
			}
		})
	})
})

// Instantiate error Div
var appendErrorDiv = function(errorText) {
	html = "<div class='alert alert-danger error' role='alert'>"
	html += '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>'
	html += errorText + "</div>";
	$("#content").prepend(html);
}

