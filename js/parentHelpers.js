var isAdmin = function(data) {
    // See if firstname exists. If so, then either admin or parent
    try {
        // If parent, return true
        if (data["firstName"] == "Admin") {
            console.log("You're an Admin!");
            return(true);
        } 
        else 
        {
            console.log("Youre not an Admin");
            return(false);
        }
    } 
    // Otherwise not admin or parent and should return login screen
    catch (err)
    {
        window.location.href = "../login.html";

    }

}

// When page is visited, clear the notifications on the sidebar
// Page is the name of the page. i.e forums/tasks
var clearNotifications = function(Page) {
    // If there's already section Updates, let's update this
    if (localStorage.getItem("updatedSections")) {
        // check if there are already notifications of this type
        sectionUpdates = JSON.parse(localStorage.getItem("updatedSections"));
        for (i = 0; i < sectionUpdates.length; i++)
        {
            // If the section already has an update, add to the number of updates 
            if (sectionUpdates[i]["section"] == Page) {
                // Delete the object for this in JSON
                sectionUpdates.splice(i, 1);
                // Remove it from the screen
                $("." + Page + " .badge").remove();
            } 
        }
        localStorage.setItem("updatedSections", JSON.stringify(sectionUpdates));
    } 
}