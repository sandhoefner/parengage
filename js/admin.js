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
		for (i = 0; i < data["weeklyParentData"]["Sep5"].length; i++) 
		{
			parentsSeptember5th += data["weeklyParentData"]["Sep5"][i]["parents"];
		}
		// Create Summary Divs and Instantiate them onto page
		createWeeklySummaryDiv("Summary for Week of 9/26", "Sep26", generateGradeLevelArray(data, "Sep26"));
		createWeeklySummaryDiv("Summary for Week of 9/19", "Sep19", generateGradeLevelArray(data, "Sep19"));
		createWeeklySummaryDiv("Summary for Week of 9/12", "Sep12", generateGradeLevelArray(data, "Sep12"));
		createWeeklySummaryDiv("Summary for Week of 9/5", "Sep5", generateGradeLevelArray(data, "Sep5"));
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
		missingParents = data["weeklyParentData"][date][i]["missingParents"];
		console.log(missingParents);
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

// Week parameter treated purely to append progress bars to correct Div
var createWeeklySummaryDiv = function(title, week, allGradesArray) {

	// Create weekly summary div for progress bars to be added to
	var html = '<div class="weekSummary' + week + '"><h3>' + title + '</h3></div>';
	$("#content").append(html);

	// Create overall progress Div for the week
	html = createProgressBar(allGradesArray[4][0], allGradesArray[4][1], allGradesArray[i][2], true, week);
	$(".weekSummary" + week).append(html); 

	// Add quick number of parents that participated
	var quickSumHTML = "<div class='weekSum weekSum" + week + "'>";
	quickSumHTML += "<p><b>" + allGradesArray[4][1] + "/" + allGradesArray[4][2] + "</b> parents participated this week</p>"; 
	quickSumHTML += "</div>";
	$(".header" + week).append(quickSumHTML);

	// Create Dropdown button and attach it to weekSummary div to reveal parent participation by grade level
	// ".header" + week is created in createProgressBar
	var dropDownHTML = '<button class="dropdown'+ week + ' btn btn-info" id="btn-gradeDropdown">';
	dropDownHTML += '<span style="font-size: 16">By Grade Level</span>';
	dropDownHTML += '<span class="glyphicon glyphicon-menu-down" aria-hidden="true" style="font-size: 15"></span>';
	dropDownHTML += '</button>';
	$(".header" + week).append(dropDownHTML);

	// Create Div that will contain all the progress bars by grade level
	$(".weekSummary" + week).append("<div class='weeklyBreakdownDiv" + week + "'>");

	// That div should initially be hidden
	$(".weeklyBreakdownDiv" + week).hide();

	// Show or hide parent participation by gradelevel based on whether it's already open or not
	$(".dropdown" + week).click(function() {
		if ($(".weeklyBreakdownDiv" + week).is(":hidden")) {
			$(".weeklyBreakdownDiv" + week).show();
		} else {
			$(".weeklyBreakdownDiv" + week).hide();
		}
	})

	// Create progress bar to add for 9th - 12th graders; length -1 because the last item in array is the overall weekly % for all grades
	for (i = 0; i < allGradesArray.length - 1; i++) 
	{
		html = createProgressBar(allGradesArray[i][0], allGradesArray[i][1], allGradesArray[i][2], false, week);
		$(".weeklyBreakdownDiv" + week).append(html);
		//TODO: THIS IS HARD CODED. NEED SOMETHING ELSE BESIDES PUTTING IN SEP5. PROBABLY NEEDS CHANGE IN JSON
	}
}

/*
*
*Creates the Progress Bar DOM HTML to be added to the page. Not actually instantiated until createWeeklySummaryDiv is called
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

	// How big the title is depending on whether it's the header (summary for the week) or just a grade levle breakdown
	if (bold) 
	{
		html += '<h3>' + title + '</h3>';
	} else 
	{
		html += '<h5>' + title + '</h5>'
	}

	// Depending on participation level of parents, change the color of the progress bar
	var progressStatus = "";
	if (percentActive > 75) 
	{
		progressStatus = "progress-bar-success";
	} 
	else if (percentActive >50) {
		progressStatus = "progress-bar-warning";
	}
	else {
		progressStatus = "progress-bar-danger";
	}

	html += '<div class="progress">';
	html += '<div class="progress-bar ' + progressStatus + ' parentProgress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"';
	html+= 'style="width:' + Math.round(percentActive) + '%;">';
	html+= Math.round(percentActive) + '%';
	html+= '</div>';
	html+= '</div>';
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
