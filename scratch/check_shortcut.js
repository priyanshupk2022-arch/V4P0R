const { execSync } = require('child_process');
const psScript = `
$w = New-Object -ComObject WScript.Shell
$s = $w.CreateShortcut("C:\\Users\\priya\\OneDrive\\Desktop\\Open Design.lnk")
Write-Host "TARGET:" $s.TargetPath
Write-Host "ARGS:" $s.Arguments
Write-Host "WORKDIR:" $s.WorkingDirectory
`;
try {
  const out = execSync(`powershell -Command "${psScript.replace(/\n/g, '; ')}"`);
  console.log(out.toString());
} catch (e) {
  console.error(e.stdout ? e.stdout.toString() : e.message);
}
