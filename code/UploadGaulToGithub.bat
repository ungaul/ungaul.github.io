@echo off

:: Source and destination directories
set SOURCE_DIR=C:\MEGA\Nationalism
set DEST_ORIGINAL=C:\Users\gaulerie\Documents\Github\ungaul.github.io\gallery\assets\img\gaul\original
set DEST_MIN=C:\Users\gaulerie\Documents\Github\ungaul.github.io\gallery\assets\img\gaul\min

:: Clear destination folders
echo Clearing the original folder...
rd /s /q "%DEST_ORIGINAL%" || (
    powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error clearing original folder!')"
    exit /b 1
)
mkdir "%DEST_ORIGINAL%" || (
    powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error creating original folder!')"
    exit /b 1
)

echo Clearing the min folder...
rd /s /q "%DEST_MIN%" || (
    powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error clearing min folder!')"
    exit /b 1
)
mkdir "%DEST_MIN%" || (
    powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error creating min folder!')"
    exit /b 1
)

:: Copy only .jpg files to the original folder excluding specific subfolders and their subdirectories
echo Copying JPG files to the original folder excluding specific subfolders and their subdirectories...
for /r "%SOURCE_DIR%" %%f in (*.jpg) do (
    echo "%%~dpf" | findstr /i /r "Memes Shitpost Indo-Europeans" >nul
    if errorlevel 1 (
        copy "%%f" "%DEST_ORIGINAL%" /y || (
            powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error copying files!')"
            exit /b 1
        )
    )
)

:: Convert .jpg images to webp with a maximum width of 800px in the min folder
echo Converting JPG files to webp format in the min folder...
for %%f in ("%DEST_ORIGINAL%\*.jpg") do (
    magick "%%f" -resize 800x "%DEST_MIN%\%%~nf.webp" || (
        powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error converting to webp!')"
        exit /b 1
    )
)

:: Navigate to the GitHub repository
cd C:\Users\gaulerie\Documents\Github\ungaul.github.io

:: Add changes to Git
echo Adding changes to the Git repository...
git add . || (
    powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error adding changes to Git!')"
    exit /b 1
)

:: Commit changes with a message
git commit -m "Automatic update of images" || (
    powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error committing changes!')"
    exit /b 1
)

:: Push changes to GitHub
git push origin main || git push origin gh-pages || (
    powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Error pushing changes to GitHub!')"
    exit /b 1
)

:: Success notification
powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Process completed successfully!')"
