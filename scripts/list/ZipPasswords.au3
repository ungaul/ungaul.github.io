; Path to 7z.exe
$zipProgram = "C:\Program Files\7-Zip\7z.exe"

; Arguments for creating the zip archive
$zipArguments = 'a -tzip "C:\MEGA\Others\Backup\Backup ID.zip" "C:\MEGA\Documents\ID" -y'

; Function to show a Windows notification based on success or failure
Func NotifyResult($status)
    If $status = "success" Then
        TrayTip("Process Complete", "✅ Backup was successfully created!", 10)
    ElseIf $status = "error" Then
        TrayTip("Process Failed", "❌ There was an issue during the backup process.", 10)
    EndIf
    Sleep(5000) ; Keep the notification visible for 5 seconds
EndFunc

; Execute the command to create the zip archive
Run('"' & $zipProgram & '" ' & $zipArguments)

; Wait a bit for the process to complete (adjust the sleep time if needed)
Sleep(5000)

; Check if the zip file was created successfully
If FileExists("C:\MEGA\Others\Backup\Backup ID.zip") Then
    ; Notify success if the file exists
    NotifyResult("success")
Else
    ; Notify failure if the file was not created
    NotifyResult("error")
EndIf
