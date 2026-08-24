Set WshShell = CreateObject("WScript.Shell")
' Start Backend
WshShell.Run "cmd /c python server.py", 0
' Start Voice Assistant
WshShell.Run "cmd /c python persona_ai.py", 0
' Wait a bit for backend
WScript.Sleep 2000
' Start Frontend
WshShell.Run "cmd /c cd web_app && npm run dev", 0
Set WshShell = Nothing
