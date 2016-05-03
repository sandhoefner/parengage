// add toolbar to page

var div = document.createElement('div');
div.className = 'sidebar-wrapper col-md-2 col-sm-3 col-xs-3'
div.id = 'toolbar';
containerDiv = document.getElementById("content");
document.body.insertBefore(div, containerDiv)
//document.body.appendChild(div);

var ul = document.createElement('ul');
ul.className = 'sidebar-nav';
ul.id = 'toolbar_list';
document.getElementById('toolbar').appendChild(ul);

var toolbar = ['Grades', 'Calendar', 'Messages', 'Tasks', 'Colleges', 'Forum', 'My History', 'Help', 'Log Out'];
var glyphicons = ['book', 'calendar', 'envelope', 'check', 'globe', 'comment', 'tasks', 'question-sign', 'log-out']
var links = ['index.html', 'calendar.html', 'message.html', 'tasks.html', 'colleges.html', 'forum.html', 'my_history.html', 'help.html', 'login.html'];

// Check if there have been any updates
/*
var updatedSections = [
	{
		"section" : "Grades",
		"numberUpdates" : 1

	}
];*/

//localStorage.setItem("updatedSections", JSON.stringify(updatedSections));
sectionUpdates = JSON.parse(localStorage.getItem("updatedSections"));

for (button in toolbar) {
  var li = document.createElement('li');
  li.className = 'toolbar_button';
  li.id = toolbar[button];
  li.innerHTML = '<a class='+ toolbar[button] + ' href="' + links[button] + '">' + '<span class="glyphicon glyphicon-' + glyphicons[button] + ' aria-hidden="true"></span>'+ toolbar[button] + '</a>';

  document.getElementById('toolbar_list').appendChild(li);
}

// If there are updates, show that updates are available on the sidebar
if (sectionUpdates) {
	for (i = 0; i < sectionUpdates.length; i++ ) {
		$("." + sectionUpdates[i]["section"]).append('<span class="badge">' + sectionUpdates[i]["numberUpdates"] + '</span>');
	}
} else {
	console.log("No sectionUpdates");
}

