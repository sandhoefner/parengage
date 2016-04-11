// Test to make sure we can grab the grades data from data.json
// Requires running a local server

$.getJSON("../data.json", function(data){
	console.log(data);
})
