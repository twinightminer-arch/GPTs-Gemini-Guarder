param(
  [ValidateSet('attach','move','detach')][string]$Action,
  [int]$ParentWidth = 0,
  [int]$X = 0, [int]$Y = 0, [int]$Width = 0, [int]$Height = 0
)
$ErrorActionPreference='Stop'
$statePath=Join-Path $env:LOCALAPPDATA 'GPTDaddy\gemini-dock.json'
Add-Type -TypeDefinition @'
using System; using System.Text; using System.Runtime.InteropServices;
public static class DockWin {
 public delegate bool Callback(IntPtr h,IntPtr l);
 [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L,T,R,B; }
 [DllImport("user32.dll")] public static extern bool EnumWindows(Callback c,IntPtr l);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h,StringBuilder s,int n);
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h,out RECT r);
 [DllImport("user32.dll")] public static extern IntPtr GetParent(IntPtr h);
 [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr h);
 [DllImport("user32.dll")] public static extern IntPtr GetSystemMenu(IntPtr h,bool revert);
 [DllImport("user32.dll")] public static extern bool EnableMenuItem(IntPtr menu,uint item,uint flags);
 [DllImport("user32.dll")] public static extern bool DrawMenuBar(IntPtr h);
 [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
 [DllImport("user32.dll",EntryPoint="GetWindowLongPtrW")] public static extern IntPtr GetWindowLongPtr(IntPtr h,int n);
 [DllImport("user32.dll",EntryPoint="SetWindowLongPtrW")] public static extern IntPtr SetWindowLongPtr(IntPtr h,int n,IntPtr v);
 [DllImport("user32.dll",SetLastError=true)] public static extern IntPtr SetParent(IntPtr child,IntPtr parent);
 [DllImport("user32.dll",SetLastError=true)] public static extern bool SetWindowPos(IntPtr h,IntPtr after,int x,int y,int w,int hgt,uint flags);
}
'@
function WindowsForPid([uint32]$pidValue) {
  $list=New-Object System.Collections.Generic.List[object]
  $callback=[DockWin+Callback]{
    param($h,$l)
    [uint32]$processId=0
    [void][DockWin]::GetWindowThreadProcessId($h,[ref]$processId)
    if($processId -eq $l.ToInt64() -and [DockWin]::IsWindowVisible($h)) {
      [DockWin+RECT]$rect=New-Object DockWin+RECT
      [void][DockWin]::GetWindowRect($h,[ref]$rect)
      $title=New-Object System.Text.StringBuilder 256
      [void][DockWin]::GetWindowText($h,$title,256)
      $list.Add([pscustomobject]@{Hwnd=$h.ToInt64();Width=$rect.R-$rect.L;Height=$rect.B-$rect.T;Title=$title.ToString();L=$rect.L;T=$rect.T})
    }
    return $true
  }
  [void][DockWin]::EnumWindows($callback,[IntPtr]$pidValue)
  return $list.ToArray()
}
function Restore {
  if(-not (Test-Path -LiteralPath $statePath)){return @{restored=$false}}
  $state=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  $child=[IntPtr][long]$state.child
  if([DockWin]::IsWindow($child) -and ($null -eq $state.parent -or [DockWin]::GetParent($child) -eq [IntPtr][long]$state.parent)) {
    if($state.mode -eq 'overlay') {[void][DockWin]::SetWindowLongPtr($child,-8,[IntPtr][long]$state.oldOwner)}
    else {[void][DockWin]::SetParent($child,[IntPtr][long]$state.oldParent)}
    [void][DockWin]::SetWindowLongPtr($child,-16,[IntPtr][long]$state.oldStyle)
    if($null -ne $state.oldExStyle){
      # Never restore WS_EX_APPWINDOW: the Gemini window must not appear as a taskbar app.
      $restoreExStyle = ([long]$state.oldExStyle -band (-bnot 0x00040000L)) -bor 0x00000080L
      [void][DockWin]::SetWindowLongPtr($child,-20,[IntPtr][long]$restoreExStyle)
    }
    [void][DockWin]::SetWindowPos($child,[IntPtr]::Zero,[int]$state.l,[int]$state.t,[int]$state.w,[int]$state.h,0x0040)
  }
  Remove-Item -LiteralPath $statePath
  return @{restored=$true}
}
if($Action -eq 'detach'){Restore|ConvertTo-Json -Compress;exit 0}
if($Width -lt 100 -or $Height -lt 100){throw 'Invalid dock rectangle'}
if($Action -eq 'move'){
  if(Test-Path -LiteralPath $statePath){
    $state=Get-Content -LiteralPath $statePath -Raw|ConvertFrom-Json
    $child=[IntPtr][long]$state.child
    if([DockWin]::IsWindow($child)){
      if([DockWin]::GetParent($child) -ne [IntPtr][long]$state.parent){@{moved=$false;independent=$true}|ConvertTo-Json -Compress;exit 0}
      $state.x=$X;$state.y=$Y;$state.width=$Width;$state.height=$Height
      $state|ConvertTo-Json -Compress|Set-Content -LiteralPath $statePath -Encoding UTF8
      if(-not[DockWin]::IsWindowVisible($child)){@{moved=$true;deferred=$true}|ConvertTo-Json -Compress;exit 0}
      if($state.mode -eq 'overlay'){
        [DockWin+RECT]$parentRect=New-Object DockWin+RECT
        [void][DockWin]::GetWindowRect([IntPtr][long]$state.parent,[ref]$parentRect)
        $X+=$parentRect.L;$Y+=$parentRect.T
      }
      if(-not[DockWin]::SetWindowPos($child,[IntPtr]::Zero,$X,$Y,$Width,$Height,0x0010)){throw 'Move failed'}
      @{moved=$true}|ConvertTo-Json -Compress;exit 0
    }
    [void](Restore)
  }
  $Action='attach'
}
if(Test-Path -LiteralPath $statePath){[void](Restore)}
$codex=Get-CimInstance Win32_Process -Filter "Name='ChatGPT.exe'"|Where-Object { $_.ExecutablePath -like '*\WindowsApps\OpenAI.Codex_*\app\ChatGPT.exe' -and $_.CommandLine -notmatch '--type=' }|Select-Object -First 1
if(-not $codex){throw 'Verified Codex process unavailable'}
$parents=@(WindowsForPid([uint32]$codex.ProcessId)|Where-Object { [math]::Abs($_.Width-$ParentWidth) -lt 40 -and $_.Height -gt 500 })
if($parents.Count -ne 1){throw "Could not identify exact Codex render window ($($parents.Count) candidates)"}
$parent=[IntPtr][long]$parents[0].Hwnd
$chrome=Get-CimInstance Win32_Process -Filter "Name='chrome.exe'"|Where-Object { $_.CommandLine -notmatch '--type=' }|Select-Object -First 1
$windows=if($chrome){@(WindowsForPid([uint32]$chrome.ProcessId)|Where-Object {$_.Title -match 'Gemini' -or ($_.Width -ge 300 -and $_.Width -le 900 -and $_.Height -ge 400)})}else{@()}
$windows=@($windows)
if($windows.Count -eq 0){
  $chromeExe=Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'
  if(-not(Test-Path -LiteralPath $chromeExe)){throw 'Google Chrome is not installed'}
  Start-Process -FilePath $chromeExe -ArgumentList @('--profile-directory=Default','--app=https://gemini.google.com/') -WindowStyle Hidden
  for($i=0;$i -lt 30;$i++){
    Start-Sleep -Milliseconds 500
    $chrome=Get-CimInstance Win32_Process -Filter "Name='chrome.exe'"|Where-Object { $_.CommandLine -notmatch '--type=' }|Select-Object -First 1
    if($chrome){$windows=@(WindowsForPid([uint32]$chrome.ProcessId)|Where-Object {$_.Title -match 'Gemini' -or ($_.Width -ge 300 -and $_.Width -le 900 -and $_.Height -ge 400)})}
    if($windows.Count -eq 1){break}
  }
}
if($windows.Count -ne 1){throw "Could not identify exact Gemini window ($($windows.Count) candidates; Chrome PID $($chrome.ProcessId); visible $((WindowsForPid([uint32]$chrome.ProcessId)|ConvertTo-Json -Compress)))"}
$w=$windows[0];$child=[IntPtr][long]$w.Hwnd
if([DockWin]::GetDpiForWindow($child) -ne [DockWin]::GetDpiForWindow($parent)){throw 'DPI mismatch'}
$oldParent=[DockWin]::GetParent($child);$oldOwner=[DockWin]::GetWindowLongPtr($child,-8);$oldStyle=[DockWin]::GetWindowLongPtr($child,-16);$oldExStyle=[DockWin]::GetWindowLongPtr($child,-20)
$newStyle=($oldStyle.ToInt64() -bor 0x80000000L) -band (-bnot 0x00020000L)
$record=@{mode='overlay';child=$child.ToInt64();parent=$parent.ToInt64();oldParent=$oldParent.ToInt64();oldOwner=$oldOwner.ToInt64();oldStyle=$oldStyle.ToInt64();oldExStyle=$oldExStyle.ToInt64();dockStyle=$newStyle;l=$w.L;t=$w.T;w=$w.Width;h=$w.Height;x=$X;y=$Y;width=$Width;height=$Height}
try {
  [void][DockWin]::SetWindowLongPtr($child,-16,[IntPtr]$newStyle)
  [void][DockWin]::SetWindowLongPtr($child,-20,[IntPtr](($oldExStyle.ToInt64() -band (-bnot 0x00040000L)) -bor 0x00000080L))
  [void][DockWin]::SetWindowLongPtr($child,-8,$parent)
  [void][DockWin]::EnableMenuItem([DockWin]::GetSystemMenu($child,$false),0xF020,0x00000001)
  [void][DockWin]::DrawMenuBar($child)
  if([DockWin]::GetParent($child) -ne $parent){throw 'Window ownership failed'}
  if(-not[DockWin]::SetWindowPos($child,[IntPtr]::Zero,($parents[0].L+$X),($parents[0].T+$Y),$Width,$Height,0x0060)){throw 'Placement failed'}
  $record|ConvertTo-Json -Compress|Set-Content -LiteralPath $statePath -Encoding UTF8
  @{attached=$true;child=$child.ToInt64();parent=$parent.ToInt64()}|ConvertTo-Json -Compress
} catch {
  [void][DockWin]::SetWindowLongPtr($child,-8,$oldOwner)
  [void][DockWin]::SetWindowLongPtr($child,-16,$oldStyle)
  [void][DockWin]::SetWindowLongPtr($child,-20,$oldExStyle)
  [void][DockWin]::SetWindowPos($child,[IntPtr]::Zero,$w.L,$w.T,$w.Width,$w.Height,0x0040)
  throw
}
