import vertexai
from vertexai.generative_models import GenerativeModel
import os

# You need to provide your Google Cloud Project ID here
# Example: PROJECT_ID = "my-awesome-project-12345"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "neon-rampart-475915-m4-46740d87b362.json"
PROJECT_ID = "neon-rampart-475915-m4"
LOCATION = "us-central1" # The default region for Vertex AI

def test_vertex():
    print("Initializing Vertex AI...")
    # Initialize vertexai with your project
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    
    # Load the Gemini 2.5 Flash model from Vertex AI
    print("Loading Gemini 2.5 Flash...")
    model = GenerativeModel("gemini-2.5-flash")
    
    print("Sending query...")
    response = model.generate_content("Hello! What is the capital of France?")
    
    print("\nVertex AI Response:")
    print(response.text)

if __name__ == "__main__":
    test_vertex()
