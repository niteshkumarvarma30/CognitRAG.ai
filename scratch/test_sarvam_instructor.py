import os
from openai import OpenAI
import instructor
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class Person(BaseModel):
    name: str
    age: int

# We must try JSON mode or Tool Calling mode
try:
    client = instructor.from_openai(OpenAI(
        api_key=os.environ.get("SARVAM_API_KEY"),
        base_url="https://api.sarvam.ai/v1"
    ), mode=instructor.Mode.JSON)

    res = client.chat.completions.create(
        model="sarvam-30b",
        response_model=Person,
        messages=[{"role": "user", "content": "Extract: John is 30 years old."}]
    )
    print("SUCCESS JSON:", res)
except Exception as e:
    print("FAILED JSON:", e)

try:
    client = instructor.from_openai(OpenAI(
        api_key=os.environ.get("SARVAM_API_KEY"),
        base_url="https://api.sarvam.ai/v1"
    ))

    res = client.chat.completions.create(
        model="sarvam-30b",
        response_model=Person,
        messages=[{"role": "user", "content": "Extract: John is 30 years old."}]
    )
    print("SUCCESS TOOL:", res)
except Exception as e:
    print("FAILED TOOL:", e)
