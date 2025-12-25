import requests

url = "http://localhost:8000/generate-quiz"
files = {'file': open('uploads/Environment_3_Pages_Notes.pdf', 'rb')}
data = {'num_questions': 2, 'difficulty': 'Easy'}

try:
    response = requests.post(url, files=files, data=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
