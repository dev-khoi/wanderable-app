6/12 done the globe feature add in the authentication with the database

things to do before shipping: rls authentication flow audit

package conflict solve when building for android: adb uninstall com.khoilikereact.wanderable and then rebuild

https://chatgpt.com/c/6a2d6afd-1890-83ea-bbaf-2d06682bc224

adb -s emulator-5554 uninstall com.khoilikereact.wanderable

business model: I want this to be more instagrammy but follow polarsttep busines modal 1 trip (or post but dont really use post) many highlights many stories each story contains media (photo, video, audio) and text (description, title, location, date) like a journal

this derives the UI: no need for the d1, d2 ,d3 to keep track of the highlight,

but i want it the highlights to be next together and then we can swipe between highlight, when click on the highlight, i want it to animation only cover like 80% of the screen when highlights are open, click left half to go back, click right half to go forward, hold to stop, and then we can swipe between highlights.

when it is not open we can keep swiping and let say it jumped to 2nd highlight, then the map will follow the 2nd highlight, rather than having to click d1, d2, d3

for now trip will belong to a user only, but they can share to view it

add trip feature and generate trip will be added later but from the database, we should be able to get all the needed infomration to create highlights on the map

media types: photos + video, no need for cap of maxiumum puload

Core Metadata Included:Time & Location: Exact date, time, and a geotagged map of where the media was shot (unless disabled in privacy settings). so from that core metadata, we want the user to be able to upload, and our algorithm will understand

I want it to have smooth animation

