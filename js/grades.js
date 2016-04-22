var div = document.createElement('div');
div.id = 'grades';
document.body.appendChild(div);
div.innerHTML = "<h1>Student's Grades</h1>";

var ul = document.createElement('ul');
ul.id = 'grades_list';
document.getElementById('grades').appendChild(ul);

var classes = [{class_name:'English', grade: 90}, {class_name:'Science', grade: 82}, {class_name:'Math', grade: 92}, {class_name:'US History', grade: 86}, {class_name:'Health', grade: 96} ];

for (class_info in classes) {
  var li = document.createElement('li');
  li.class = 'class_link';
  li.id = classes[class_info];
  li.innerHTML = 'Class: ' + classes[class_info].class_name + '  Grade: ' + classes[class_info].grade + '</a>';
  document.getElementById('grades_list').appendChild(li);
}
// Test to make sure we can grab the grades data from data.json
// Requires running a local server

$.getJSON("../data.json", function(data){
	console.log(data);
})