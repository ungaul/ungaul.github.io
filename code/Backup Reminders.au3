; Function to click at specific coordinates (X, Y)
Func ClickAtCoords($xCoord, $yCoord)
    MouseClick("left", $xCoord, $yCoord)
    Sleep(500) ; Pause after each click to avoid errors
EndFunc

; Function to notify about the process result
Func NotifyResult($status)
    If $status = "success" Then
        TrayTip("Process Complete", "✅ Reminders export was successfully completed!", 10)
    ElseIf $status = "error" Then
        TrayTip("Process Failed", "❌ There was an issue during the reminders export process.", 10)
    EndIf
    Sleep(5000) ; Keep the notification for 5 seconds
EndFunc

; Open Microsoft To-Do in a new window, maximized
ShellExecute("chrome.exe", "--new-window --start-maximized https://to-do.live.com/tasks/planned")
Sleep(5000) ; Wait for the page to load

; Maximize the Chrome window
WinWaitActive("[CLASS:Chrome_WidgetWin_1]") ; Wait for the Chrome window to be active
WinSetState("[CLASS:Chrome_WidgetWin_1]", "", @SW_MAXIMIZE) ; Maximize the Chrome window
Sleep(2000)

; Select all content (Ctrl + A) and copy it (Ctrl + C)
Send("^a")
Sleep(1000)
Send("^c")
Sleep(1000)

; Close the Chrome window (Alt + F4)
Send("!{F4}")
Sleep(2000)

; Open the Excel file
ShellExecute("C:\MEGA\Others\Backup\Backup Reminders.xlsx")
Sleep(3000) ; Wait for Excel to load

; Select all content in Excel (Ctrl + A)
Send("^a")
Sleep(1000)

; Move to A1 (left arrow)
Send("{LEFT}")
Sleep(500)

; Delete all selected content
Send("{DEL}")
Sleep(1000)

; Paste the copied reminders (Ctrl + V)
Send("^v")
Sleep(1000)

; Save the file (Ctrl + S)
Send("^s")
Sleep(1000)

; Close Excel (Alt + F4)
Send("!{F4}")
Sleep(2000)

; Force close Excel in case it doesn't close properly
ProcessClose("EXCEL.EXE")
Sleep(2000)

; Check if the Excel file was updated successfully
If FileExists("C:\MEGA\Others\Backup\Backup Reminders.xlsx") Then
    ; Notify success if the file exists
    NotifyResult("success")
Else
    ; Notify failure if the file was not created or updated
    NotifyResult("error")
EndIf
