@echo off
rem Feifei Tainan Policy Island: opens /island/?kiosk=1 in Chrome kiosk mode
rem (true fullscreen: no tabs, no address bar, no Windows taskbar, Esc does not leave it).
rem To close it press Alt+F4.
rem kiosk=1 turns on the touch-kiosk version: larger touch targets, links locked,
rem auto tour, reset after 60 s idle (change with &idle=90), screen kept awake,
rem offline cache. Videos still need the internet.
rem The separate profile folder makes kiosk mode work even if Chrome is already open,
rem and keeps it apart from the AI board kiosk.

set "URL=https://feifei-tainan-policy.com/island/?kiosk=1"

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" goto nochrome

rem --disable-pinch: two fingers do not zoom the whole page (the 3D map still zooms)
rem --overscroll-history-navigation=0: swiping sideways does not go back a page
rem --hide-crash-restore-bubble: no "Restore pages?" bubble after a power cut
start "" "%CHROME%" --kiosk "%URL%" --user-data-dir="%LOCALAPPDATA%\FeifeiIslandKiosk" --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required --disable-pinch --overscroll-history-navigation=0 --hide-crash-restore-bubble --disable-features=TranslateUI --noerrdialogs
exit /b 0

:nochrome
echo Google Chrome was not found on this computer.
pause
exit /b 1
