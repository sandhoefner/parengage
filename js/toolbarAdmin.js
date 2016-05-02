// add toolbar (admin view) to page

var div = document.createElement('div');
div.className = 'sidebar-wrapper col-md-3 col-sm-3 col-xs-4'
div.id = 'toolbar';
containerDiv = document.getElementById("content");
document.body.insertBefore(div, containerDiv)
//document.body.appendChild(div);

var ul = document.createElement('ul');
ul.className = 'sidebar-nav';
ul.id = 'toolbar_list';
document.getElementById('toolbar').appendChild(ul);

var toolbar = ['Dashboard', 'Calendar', 'Tasks', 'Forum', 'Colleges', 'Log Out'];
var glyphicons = ['book', 'calendar', 'envelope', 'comment', 'globe', 'log-out']
var links = ['adminDashboard.html', 'admincalendar.html', 'adminTasks.html', 'forum.html', 'adminColleges.html', 'login.html'];

for (button in toolbar) {
  var li = document.createElement('li');
  li.className = 'toolbar_button';
  li.id = toolbar[button];
  li.innerHTML = '<a href="' + links[button] + '">' + '<span class="glyphicon glyphicon-' + glyphicons[button] + ' aria-hidden="true"></span>'+ toolbar[button] + '</a>';

  document.getElementById('toolbar_list').appendChild(li);
}