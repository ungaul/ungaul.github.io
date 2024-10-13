; Fonction pour cliquer à un endroit spécifique (coordonnées X, Y)
Func ClickAtCoords($xCoord, $yCoord)
    MouseClick("left", $xCoord, $yCoord)
    Sleep(500) ; Pause après chaque clic pour éviter les erreurs
EndFunc

; Fonction qui effectue le raccourci clavier Alt + F + S + N + A
Func ExportShortcut()
    Send("!fsna") ; Alt suivi de F, S, N, A
    Sleep(2000)
    ClickAtCoords(489, 50)
    Sleep(2000)
    Send("C:\MEGA\Documents\Etudes\Cours{ENTER}")
    Sleep(1000)
    ClickAtCoords(658, 514) 
    Sleep(1000)
    Send("{LEFT}{ENTER}")
    Sleep(2000)
    Sleep(60000)
EndFunc

; Fonction pour afficher une notification Windows à la fin
Func NotifyResult($status)
    If $status = "success" Then
        TrayTip("Process Complete", "✅ Export was successfully completed!", 10)
    ElseIf $status = "error" Then
        TrayTip("Process Failed", "❌ There was an issue during the export process.", 10)
    EndIf
    Sleep(5000) ; Maintenir la notification pendant 5 secondes
EndFunc

; Ouvrir OneNote (ou remplace par le chemin vers le fichier .exe)
ShellExecute("C:\Program Files\Microsoft Office\root\Office16\ONENOTE.EXE")
Sleep(5000) ; Pause pour laisser OneNote se charger complètement

; Effectuer plusieurs exportations
ClickAtCoords(80, 235) 
ExportShortcut()
ClickAtCoords(80, 275) 
ExportShortcut()
ClickAtCoords(80, 315) 
ExportShortcut()
ClickAtCoords(80, 355) 
ExportShortcut()
ClickAtCoords(80, 400)
ExportShortcut()
ClickAtCoords(80, 445) 
ExportShortcut()
ClickAtCoords(80, 490) 
ExportShortcut()

; Vérifier si un fichier spécifique a été exporté correctement
If FileExists("C:\MEGA\Documents\Etudes\Cours\exported_file_name.onepkg") Then
    ; Si le fichier existe, notifier le succès
    NotifyResult("success")
Else
    ; Si le fichier n'existe pas, notifier l'échec
    NotifyResult("error")
EndIf
