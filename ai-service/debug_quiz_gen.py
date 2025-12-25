import asyncio
import os
from quiz_generator import generate_quiz_from_file
from dotenv import load_dotenv

load_dotenv()

async def main():
    print("Starting debug generation...")
    file_path = "uploads/Environment_3_Pages_Notes.pdf"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    result = await generate_quiz_from_file(file_path, 2, "Easy")
    print("Result:", result)

if __name__ == "__main__":
    asyncio.run(main())
