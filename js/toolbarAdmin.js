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

var toolbar = ['Dashboard', 'Calendar', 'Message', 'Tasks', 'Colleges', 'Forum', 'My History', 'Log Out'];
var glyphicons = ['book', 'calendar', 'envelope', 'check', 'globe', 'comment', 'tasks', 'log-out']
var links = ['adminDashboard.html', 'calendar.html', 'message.html', 'tasks.html', 'colleges.html', 'forum.html', 'my_history.html', 'login.html'];

for (button in toolbar) {
  var li = document.createElement('li');
  li.className = 'toolbar_button';
  li.id = toolbar[button];
  li.innerHTML = '<a href="' + links[button] + '">' + '<span class="glyphicon glyphicon-' + glyphicons[button] + ' aria-hidden="true"></span>'+ toolbar[button] + '</a>';

  document.getElementById('toolbar_list').appendChild(li);
}