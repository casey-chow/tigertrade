# Check if tigertrade is available. If not, we're on static.
(command -v tigertrade && tigertrade) || boot
