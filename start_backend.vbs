Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /k ""cd /d """"d:\University Stuff\Degree Year 3 Semester 2\Computing Individual Project\CrowdQuest QA Gamified Platform\CrowdQuestQA"""" && uvicorn main:app --reload --port 8000""", 0, False
