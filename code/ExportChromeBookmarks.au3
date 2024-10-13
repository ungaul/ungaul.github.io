; Function to click at specific coordinates (X, Y)
Func ClickAtCoords($xCoord, $yCoord)
    MouseClick("left", $xCoord, $yCoord)
    Sleep(500) ; Pause after each click to avoid errors
EndFunc

; Function to notify about the process result
Func NotifyResult($status)
    If $status = "success" Then
        TrayTip("Process Complete", "✅ Bookmarks export was successfully completed!", 10)
    ElseIf $status = "error" Then
        TrayTip("Process Failed", "❌ There was an issue during the bookmarks export process.", 10)
    EndIf
    Sleep(5000) ; Keep the notification for 5 seconds
EndFunc

; Open Chrome in a new window
ShellExecute("chrome.exe", "--new-window")
Sleep(3000) ; Wait for Chrome to load

; Maximize the Chrome window
WinWaitActive("[CLASS:Chrome_WidgetWin_1]") ; Wait for the Chrome window to be active
WinSetState("[CLASS:Chrome_WidgetWin_1]", "", @SW_MAXIMIZE) ; Maximize the Chrome window
Sleep(2000)

; Press Ctrl + Shift + O to open the bookmarks manager
Send("^+o")
Sleep(2000)

; Click on the three dots for more options (adjust coordinates based on your screen)
ClickAtCoords(1500, 150) ; Adjust these coordinates for your screen

; Click on "Export bookmarks"
ClickAtCoords(1415, 340) ; Adjust these coordinates for the "Export bookmarks" button
Sleep(1000)

Send("Backup Bookmarks") ; Type the file name and press Enter
Sleep(1000)

; Click on the address bar
ClickAtCoords(450, 50) ; Adjust coordinates based on your Chrome's address bar position
Send("^a") ; Select all text in the address bar
Send("C:\MEGA\Others\Backup{ENTER}") ; Type the desired file path and press Enter
Sleep(1000)
ClickAtCoords(600, 445)
; Click on the file name bar (for naming the file)
Send("{LEFT}{ENTER}")
Sleep(1000)

; Close Chrome after 2 seconds
Send("!{F4}")
Sleep(2000)

; Check if the bookmarks file was created successfully
If FileExists("C:\MEGA\Others\Backup\Backup Bookmarks.html") Then
    ; Notify success if the file exists
    NotifyResult("success")
Else
    ; Notify failure if the file was not created
    NotifyResult("error")
EndIf
