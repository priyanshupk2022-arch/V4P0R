$w = New-Object -ComObject WScript.Shell
$s = $w.CreateShortcut("C:\Users\priya\OneDrive\Desktop\Open Design.lnk")
Write-Host "TARGET: $($s.TargetPath)"
Write-Host "ARGS: $($s.Arguments)"
Write-Host "WORKDIR: $($s.WorkingDirectory)"
