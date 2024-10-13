; Fonction pour cliquer à un endroit spécifique (coordonnées X, Y)
Func ClickAtCoords($xCoord, $yCoord)
    ; 1. Si les coordonnées sont fournies, cliquer à l'emplacement défini
    If $xCoord <> "" And $yCoord <> "" Then
        MouseClick("left", $xCoord, $yCoord)
        Sleep(500) ; Petite pause après le clic
    EndIf
EndFunc

; Fonction pour vérifier l'URL dans la barre d'adresse
Func CheckURL($urlPart)
    ; Cliquer sur la barre d'adresse
    ClickAtCoords(221, 60) ; Ajuste ces coordonnées selon l'emplacement de la barre d'adresse

    ; Sélectionner tout le texte (Ctrl + A) et copier (Ctrl + C)
    Send("^a")
    Sleep(500)
    Send("^c")
    Sleep(500)

    ; Lire le contenu du presse-papier
    $url = ClipGet()

    ; Vérifier si l'URL contient la chaîne recherchée
    If StringInStr($url, $urlPart) Then
        Return True
    Else
        Return False
    EndIf
EndFunc

; 1. Ouvrir Google Takeout dans le navigateur
ShellExecute("chrome.exe", "https://takeout.google.com --new-window --start-maximized")
Sleep(5000) ; Pause pour laisser le site se charger

; 2. Cliquer sur "Deselect All" aux coordonnées définies (X1, Y1)
ClickAtCoords(993, 793)

; 3. Faire défiler la page jusqu'à "Files you own that have been stored in your My Drive and Computers."
MouseWheel("down", 26) ; Scroll vers le bas (ajuster selon la longueur de la page)
Sleep(500)

; 4. Cliquer sur "Files you own that have been stored in your My Drive and Computers."
ClickAtCoords(1027, 493)

; 3. Faire défiler la page jusqu'à "Files you own that have been stored in your My Drive and Computers."
MouseWheel("down", 50) ; Scroll vers le bas (ajuster selon la longueur de la page)
Sleep(2000)

; 4. Cliquer sur "Files you own that have been stored in your My Drive and Computers."
ClickAtCoords(1027, 443)

; 5. Faire défiler la page jusqu'à "Next step"
MouseWheel("down", 100) ; Scroll vers le bas (ajuste selon la longueur de la page)
Sleep(2000)

; 6. Cliquer sur "Next step"
ClickAtCoords(1027, 570)

; 7. Attendre que la page suivante se charge, puis cliquer sur "Create Export"
Sleep(5000)
MouseWheel("down", 100) ; Scroll vers le bas (ajuste selon la longueur de la page)
; ClickAtCoords(980, 630)

; 8. Ouvrir Gmail
ShellExecute("https://mail.google.com")
Sleep(60000)

; 9. Cliquer dans la barre de recherche de Gmail
ClickAtCoords(320, 150)
Send("Google Takeout{ENTER}") ; Taper Google Takeout et lancer la recherche
Sleep(3000)

; 10. Cliquer sur l'email contenant Google Takeout
ClickAtCoords(400, 300)

; 11. Cliquer sur "Download your files"
ClickAtCoords(870, 713)
ClickAtCoords(253, 19)
ClickAtCoords(253, 19)
Sleep(5000) ; Attendre que la page de téléchargement se charge

; 12. Condition pour vérifier si l'URL contient "https://accounts.google.com"
If CheckURL("https://accounts.google.com") Then
    ; 13. Taper le mot de passe "rb26DETT" et continuer
    ClickAtCoords(823, 442) 
    Send("rb26DETT{ENTER}")
    Sleep(2000)

    ; 14. Taper "Backup Google" comme nom du fichier, entrer le chemin d'enregistrement, et enregistrer
    Send("Backup Google{ENTER}")
    Sleep(1000)
    Send("C:\MEGA\Others\Backup{ENTER}")
    Sleep(1000)
Else
EndIf

Send("{ESCAPE}")
ClickAtCoords(917, 582)
Sleep(5000)

; 13. Taper "Backup Google" comme nom du fichier, entrer le chemin d'enregistrement, et enregistrer
ClickAtCoords(310, 60)
Send("C:\MEGA\Others\Backup{ENTER}")
Sleep(2000)
ClickAtCoords(220, 362)
Send("^a")
Send("Backup Google Drive{ENTER}{LEFT}{ENTER}")
Sleep(1000)
Send("{LEFT}{ENTER}")
Sleep(60000)
ClickAtCoords(253, 19)

; Notify the user about the result
Func NotifyResult($status)
    If $status = "success" Then
        TrayTip("Process Complete", "✅ Backup was successfully created!", 10)
    ElseIf $status = "error" Then
        TrayTip("Process Failed", "❌ There was an issue during the backup process.", 10)
    EndIf
    Sleep(5000) ; Keep the notification for 5 seconds
EndFunc

; (Your script goes here)

; Example check for success
If FileExists("C:\MEGA\Others\Backup\Backup Google.zip") Then
    ; Notify success
    NotifyResult("success")
Else
    ; Notify failure
    NotifyResult("error")
EndIf