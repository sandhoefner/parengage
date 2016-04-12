$(document).ready(function() {
	totalParents = 0;
	parentsSeptember5th = 0;
	storeData = {}
	$.getJSON("../parentDataAggregate.json", function(data){
		storeData = data;
		// Total number of parents from all grade levels
		for (i = 0; i < data["parentTotalData"].length; i++)
		{
			totalParents += data['parentTotalData'][i]["parents"];
		}
		// Total number of parents logging in the week of 9/5
		for (i = 0; i < data["weeklyParentData"]["9/5"].length; i++) 
		{
			parentsSeptember5th += data["weeklyParentData"]["9/5"][i]["parents"];
		}
		createWeeklySummaryDiv("Summary for Week of 9/5", generateGradeLevelArray(data, "9/5"));
		// createProgressBar ("Week of 9/5 - 9th Grade Activity", ninthGradeSep5thTotal, ninthGradeParentTotal);
	});
})
/*
*
*Generates grade level arrays for each grade or total that can be plugged into createWeeklySummaryDiv();
* Takes weekString for title that will be shown in DOM (i.e "9th Grade Activity") 
* Takes grade as integer 9,10,11,12
*/
var generateGradeLevelArray = function(data, date) {
	// allGradesArray is an array that will contain array data for each grade
	allGradesArray = []; 
	for (i = 0; i < 4; i++) {
		// Each array element in allGradesArray has a title, total parents of that grade who used site, and
		// total parents in that grade
		title = i+9 + "th Grade Activity";
		gradeWeekParentTotal = data["weeklyParentData"][date][i]["parents"];
		gradeParentTotal = data["parentTotalData"][i]["parents"];
		gradeArray = [title, gradeWeekParentTotal, gradeParentTotal];
		allGradesArray.push(gradeArray);
	}
	return allGradesArray;
}

// 
var createWeeklySummaryDiv = function(title, allGradesArray) {
	// Create weekly summary div for progress bars to be added to
	html = '<div class="weekSummary"><h3>' + title + '</h3></div>';
	$("#content").append(html);

	// Create progress bar to add for 9th - 12th graders
	for (i = 0; i < allGradesArray.length; i++) 
	{
		html = createProgressBar(allGradesArray[i][0], allGradesArray[i][1], allGradesArray[i][2]);
		$(".weekSummary").append(html);
	}
}

/*
*
*Generates the Progress Bar DOM elements and adds them to the page
* title = Title that will appear at top of progress bar
* parentsActive = integer for how many parents active 
* totalParents = total Parents (parentsActive will be divided by totalParents)
*/
var createProgressBar = function(title, parentsActive, totalParents) {
	percentActive = parentsActive / totalParents * 100;
	html = '<div class="progressWrapper">'
	html += '<h5>' + title + '</h5>'
	html += '<div class="progress">';
	html += '<div class="progress-bar parentProgress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"';
	html+= 'style="width:' + Math.round(percentActive) + '%;">';
	html+= Math.round(percentActive) + '%';
	html+= '</div>';
	html+= '</div>';
	html+= '</div>';
	return html;
}
