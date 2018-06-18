#!/bin/bash

PLIST=platforms/ios/*/*-Info.plist
/usr/libexec/PlistBuddy -c "Add :UIFileSharingEnabled bool YES" $PLIST

true