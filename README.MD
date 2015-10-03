# Find local NYC Restaurant Inspection Grades
Goal: In this project I used the Google Maps API to enable me to search restaurants local to NYC and 
return inspection letter grades from the NYC Open Data API. 

Results are restricted to NY. Results will be returned in right hand panel. You can also further 
filter within results by selecting checkbox and re-entering a search query. If there is no inspection grade,
results will be returned from Maps API only. 

More information about NYC inspection letter grading system can be found here:
http://www.ehagroup.com/food-safety/new-york-abc-restaurant-grading/

Technologies used:
* Google Maps API
* Knockout
* jQuery
* NYC Open Data API

In order to use, open index.html. When you enter a query a list of restaurants with their addresses (Only Manhattan/Brooklyn)
will be returned. When clicking on the name of a restaurant the map will pan to the restaurant location causing an 
infowindow to open with the following information:

Name
Location
User Rating
Food Inspection Rating
Website 

The marker will also bounce until either a new restaurant is selected, or the infowindow is closed. 

Check it out!
https://htmlpreview.github.io/?https://github.com/karn09/nyc_map/blob/master/index.html
