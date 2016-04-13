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
	totalWeeklyParents = 0;
	totalParents = calcTotalParents(data);
	for (i = 0; i < 4; i++) {
		// Each array element in allGradesArray has a title, total parents of that grade who used site, and
		// total parents in that grade
		title = i+9 + "th Grade Activity";
		gradeWeekParentTotal = data["weeklyParentData"][date][i]["parents"];
		gradeParentTotal = data["parentTotalData"][i]["parents"];
		weekOf = date;
		gradeArray = [title, gradeWeekParentTotal, gradeParentTotal, weekOf];
		allGradesArray.push(gradeArray);

		// Add the grade level's parents to calcualte total parents
		totalWeeklyParents += gradeWeekParentTotal;

	}
	// Add total gradeArray for all grades combined into allGradesArray
	summaryTitle = "Overall Parent Activity";
	weekOf = date;
	totalGradeArray = [summaryTitle, totalWeeklyParents, totalParents, weekOf];
	allGradesArray.push(totalGradeArray);

	return allGradesArray;
}

// 
var createWeeklySummaryDiv = function(title, allGradesArray) {

	// Create weekly summary div for progress bars to be added to
	html = '<div class="weekSummary"><h3>' + title + '</h3></div>';
	$("#content").append(html);

	// Create overall progress for the day
	html = createProgressBar(allGradesArray[4][0], allGradesArray[4][1], allGradesArray[i][2], true, "Sep5");
	$(".weekSummary").append(html); 

	// Create progress bar to add for 9th - 12th graders; -1 becaues the last item in array is the overall weekly % for all grades
	for (i = 0; i < allGradesArray.length - 1; i++) 
	{
		html = createProgressBar(allGradesArray[i][0], allGradesArray[i][1], allGradesArray[i][2], false, "Sep5");
		$(".headerSep5").append(html);
		//TODO: THIS IS HARD CODED. NEED SOMETHING ELSE BESIDES PUTTING IN SEP5. PROBABLY NEEDS CHANGE IN JSON
	}
}

/*
*
*Generates the Progress Bar DOM elements and adds them to the page
* title = Title that will appear at top of progress bar
* parentsActive = integer for how many parents active 
* totalParents = total Parents (parentsActive will be divided by totalParents)
* bold is bool. If true, the title will be h3 instead of h5. This is for the weekly summary rather than
* the individal grade breakdowns
* date is the date for the current week. I.e  "9/5". Is used to tag different divs
*/ 

var createProgressBar = function(title, parentsActive, totalParents, bold, date) {
	percentActive = parentsActive / totalParents * 100;
	html = '<div class="progressWrapper '
	if (bold) {
		html += 'header' + date;
	} 
	else 
	{
		html += 'breakdown';
	}

	html += '">'

	// How big the title is depending on whether it's the header
	if (bold) 
	{
		html += '<h3>' + title + '</h3>';
	} else 
	{
		html += '<h5>' + title + '</h5>'
	}
	html += '<div class="progress">';
	html += '<div class="progress-bar parentProgress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"';
	html+= 'style="width:' + Math.round(percentActive) + '%;">';
	html+= Math.round(percentActive) + '%';
	html+= '</div>';
	html+= '</div>';
	/*if (bold) 
	{
		html+= '<button class="dropdownGradeLevels">';
		html+= '<span style="font-size: 16">Activity for Each Grade</span>';
		html+= '<span class="glyphicon glyphicon-menu-down" aria-hidden="true" style="font-size: 20"></span>';
		html+= '</button>';
	}*/
	html+= '</div>';
	return html;
}

/* Takes data from json request to parentDataAggregate.json*/

var calcTotalParents = function(data) {
	totalParents = 0;
	for (i = 0; i < data["parentTotalData"].length; i++)
	{
		totalParents += data['parentTotalData'][i]["parents"];
	}
	return totalParents;
}
