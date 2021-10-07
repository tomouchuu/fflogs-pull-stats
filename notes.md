/(^01\|)/gm is the regex for changing location
(^00\|).*(\|0039\|\|Engage!\|) is the regex for countdown completing
/(^36\|).*(\|0000\|2\|)/gm is the regex for a wipe / clearing
/(^36\|).*(\|0000\|3\|)/gm is the regex for starting
/(^04\|).*(\|0000\|3\|)/gm is the regex for displaying enemy health/position. Need to check the ones pretty much immediately before the wipe regex then confirm that numbers are different. ie. the 12th and 13th columns in the list