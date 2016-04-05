// add toolbar to page

var div = document.createElement('div');
div.id = 'toolbar';
document.body.appendChild(div);

var toolbar = ['Grades', 'Calendar', 'Email', 'Tasks', 'Colleges', 'Forum', 'My History', 'Help', 'Log Out'];

for (button in toolbar) {
  var div = document.createElement('div');-
  div.class = 'toolbar_button';
  div.id = button;
  div.innerHTML = button;
  document.getElementById('toolbar').appendChild(element);
}