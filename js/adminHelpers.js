// Checks if the user is an admin; returns true or false
var isAdmin = function(data) {
    if (data["firstName"] == "Admin") {
        console.log("You're an Admin!");
        return(true);
    } else{
        console.log("Youre not an Admin");
        return(false);
    }
}

// Update the notifications that needs to be shown to parents 
// Page refers to the name of the page on the sidebar i.e Messages, Grades, Parent Forum
// Should be called when new tasks are saved
var updateNotifications = function(Page) {
    console.log("Update notifications is called for " + Page);
    // If there's already section Updates, let's update this
    if (localStorage.getItem("updatedSections")) {
        // check if there are already notifications of this type
        sectionUpdates = JSON.parse(localStorage.getItem("updatedSections"));

        // Save variables that will change in for loop if the page is already found
        var pageMatch = false;
        var index;
        for (i = 0; i < sectionUpdates.length; i++)
        {
            // If the section already has an update, add to the number of updates 
            if (sectionUpdates[i]["section"] == Page) {
                pageMatch = true;
                index = i;
            } 
        }
        // If section found, just add that there are more updates
        if (pageMatch == true) {
            console.log("Update already here");
            sectionUpdates[index]["numberUpdates"]++; 
        } 
        // Case where there's already other updates in other pages, and need to add a new page to show updates
        else {
            console.log("Push new update to existing notifications");
            var newSection = { "section" : Page, "numberUpdates" : 1}
            sectionUpdates.push(newSection);
        }
        localStorage.setItem("updatedSections", JSON.stringify(sectionUpdates));
    } 
    // Otherwise create the sectionUpdates in localStorage
    else 
    {
        var sectionUpdates = [
            {
                "section" : Page,
                "numberUpdates" : 1
            }
        ];
        console.log("updating section");
        localStorage.setItem("updatedSections", JSON.stringify(sectionUpdates));
    }
}