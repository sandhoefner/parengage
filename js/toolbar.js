// add toolbar to page

var div = document.createElement('div');
div.id = 'toolbar';
document.body.appendChild(div);

var ul = document.createElement('ul');
ul.id = 'toolbar_list';
document.getElementById('toolbar').appendChild(ul);

var toolbar = ['Grades', 'Calendar', 'Email', 'Tasks', 'Colleges', 'Forum', 'My History', 'Help', 'Log Out'];

var links = ['Grades.html', 'Calendar.html', 'Email.html', 'Tasks.html', 'Colleges.html', 'Forum.html', 'My_History.html', 'Help.html', 'Log_Out.html'];

for (button in toolbar) {
  var li = document.createElement('li');
  li.class = 'toolbar_button';
  li.id = toolbar[button];
  li.innerHTML = '<a href="' + links[button] + '">' + toolbar[button] + '</a>';
  document.getElementById('toolbar_list').appendChild(li);
}