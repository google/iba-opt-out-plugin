## Goal
A browser extension to provide persistent opt-out from targeted advertising by monitoring the
existence of the opt-out cookie, and resetting it to optout status in case it
was changed or removed.


## Implementation
The plug-in is implemented as a Chrome Extension. After installing, the plugin
sets or resets the biscotti id cookie to optout value. When enabled, the
extension listens to cookie change events. If these events change the Biscotti
id cookie value to be non-optout, or deletes the cookie, then the extension
resets the cookie back to the optout state programatically. In case an IDE
cookie (Biscotti V2) is set, the extension removes it immediately and sets the
optout cookie instead.

