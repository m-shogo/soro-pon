-- Stable Safari AX harness for Batch 13.
-- AX is only the control/observation channel; it is not VoiceOver evidence.

on listNamedItems()
  set rows to {}
  tell application "Safari" to activate
  delay 0.2
  tell application "System Events"
    tell process "Safari"
      set allItems to entire contents of front window
      repeat with itemRef in allItems
        try
          set itemRole to role of itemRef as text
          set itemName to name of itemRef as text
          if itemRole is "AXButton" or itemRole is "AXCheckBox" then
            set end of rows to itemName
          end if
        end try
      end repeat
    end tell
  end tell
  set AppleScript's text item delimiters to linefeed
  return rows as text
end listNamedItems

on pressNamedButton(expectedName, matchMode)
  tell application "Safari" to activate
  delay 0.2
  tell application "System Events"
    tell process "Safari"
      set allItems to entire contents of front window
      repeat with itemRef in allItems
        try
          set itemRole to role of itemRef as text
          set itemName to name of itemRef as text
          set nameMatches to false
          if matchMode is "exact" then
            set nameMatches to itemName is expectedName
          else
            set nameMatches to itemName starts with expectedName
          end if
          if (itemRole is "AXButton" or itemRole is "AXCheckBox") and nameMatches and enabled of itemRef then
            perform action "AXPress" of itemRef
            return itemName
          end if
        end try
      end repeat
    end tell
  end tell
  error "Enabled Safari AX control not found: " & expectedName
end pressNamedButton

on pressFirstEnabledCheckbox()
  tell application "Safari" to activate
  delay 0.2
  tell application "System Events"
    tell process "Safari"
      set allItems to entire contents of front window
      repeat with itemRef in allItems
        try
          if role of itemRef is "AXCheckBox" and enabled of itemRef then
            set itemName to name of itemRef as text
            perform action "AXPress" of itemRef
            return itemName
          end if
        end try
      end repeat
    end tell
  end tell
  error "Enabled Safari AXCheckBox not found"
end pressFirstEnabledCheckbox

on playStep()
  tell application "Safari" to activate
  delay 0.2
  set selectedTileName to missing value
  tell application "System Events"
    tell process "Safari"
      set allItems to entire contents of front window
      repeat with itemRef in allItems
        try
          set itemRole to role of itemRef as text
          set itemName to name of itemRef as text
          if itemRole is "AXHeading" and itemName is "対戦結果" then return "result"
          if itemRole is "AXButton" and enabled of itemRef then
            if itemName starts with "ツモ" or itemName starts with "ロン" or itemName starts with "スキップ" then
              perform action "AXPress" of itemRef
              return "action:" & itemName
            end if
          end if
          if itemRole is "AXCheckBox" and enabled of itemRef and selectedTileName is missing value then
            set selectedTileName to itemName
            perform action "AXPress" of itemRef
          end if
        end try
      end repeat
    end tell
  end tell
  if selectedTileName is missing value then return "wait"
  delay 0.2
  set discardName to my pressNamedButton("捨てる", "prefix")
  return "discard:" & selectedTileName & ":" & discardName
end playStep

on screenState()
  tell application "Safari" to activate
  delay 0.2
  set rotateSeen to false
  set resultSeen to false
  set gameSeen to false
  set setupSeen to false
  set topSeen to false
  tell application "System Events"
    tell process "Safari"
      set allItems to entire contents of front window
      repeat with itemRef in allItems
        try
          set itemRole to role of itemRef as text
          set itemName to name of itemRef as text
          if itemRole is "AXStaticText" and (itemName starts with "soro-ponは横画面" or itemName starts with "端末を横に") then set rotateSeen to true
          if itemRole is "AXHeading" and itemName is "対戦結果" then set resultSeen to true
          if itemRole is "AXButton" and itemName starts with "中断" then set gameSeen to true
          if itemRole is "AXButton" and itemName starts with "対局開始" then set setupSeen to true
          if itemRole is "AXButton" and itemName starts with "まず遊ぶ" then set topSeen to true
        end try
      end repeat
    end tell
  end tell
  if rotateSeen then return "rotate-prompt"
  if resultSeen then return "result"
  if gameSeen then return "game"
  if setupSeen then return "setup"
  if topSeen then return "top"
  return "unknown"
end screenState

on run argv
  if (count of argv) is 0 then error "command required"
  set commandName to item 1 of argv
  if commandName is "list" then
    return my listNamedItems()
  end if
  if commandName is "play-step" then
    return my playStep()
  end if
  if commandName is "status" then
    return my screenState()
  end if
  if (count of argv) < 2 then error "button name required"
  if commandName is "click-exact" then
    return my pressNamedButton(item 2 of argv, "exact")
  end if
  if commandName is "click-prefix" then
    return my pressNamedButton(item 2 of argv, "prefix")
  end if
  error "unknown command: " & commandName
end run
