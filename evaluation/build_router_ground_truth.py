import json
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from Evaluation.store_results import RESULTS_DIR

def main():
    ground_truth = [
        # FAQ (15)
        {"query": "password kaise change karu?", "gold_route": "faq"},
        {"query": "customer support ka number kya hai", "gold_route": "faq"},
        {"query": "pricing plans batao", "gold_route": "faq"},
        {"query": "how to reset my password", "gold_route": "faq"},
        {"query": "mujhe refund chahiye", "gold_route": "faq"},
        {"query": "what are the working hours?", "gold_route": "faq"},
        {"query": "where is the office located", "gold_route": "faq"},
        {"query": "app login nahi ho raha", "gold_route": "faq"},
        {"query": "do you have a free trial", "gold_route": "faq"},
        {"query": "emi option available hai?", "gold_route": "faq"},
        {"query": "forgot my username", "gold_route": "faq"},
        {"query": "how to delete account", "gold_route": "faq"},
        {"query": "subscription cancel karna hai", "gold_route": "faq"},
        {"query": "what is the validity of the plan", "gold_route": "faq"},
        {"query": "how to change language", "gold_route": "faq"},
        
        # Technical Query (25)
        {"query": "server down error 502 aa raha hai", "gold_route": "technical_query"},
        {"query": "API rate limit exceed ho gaya", "gold_route": "technical_query"},
        {"query": "Stripe webhook 401 error", "gold_route": "technical_query"},
        {"query": "database connection timeout", "gold_route": "technical_query"},
        {"query": "docker container keep restarting", "gold_route": "technical_query"},
        {"query": "how to set up oauth2 in python", "gold_route": "technical_query"},
        {"query": "node.js memory leak debug", "gold_route": "technical_query"},
        {"query": "k8s pod crashloopbackoff", "gold_route": "technical_query"},
        {"query": "AWS S3 bucket policy for public read", "gold_route": "technical_query"},
        {"query": "redis caching configuration", "gold_route": "technical_query"},
        {"query": "nginx reverse proxy 504 gateway timeout", "gold_route": "technical_query"},
        {"query": "how to migrate from postgres 12 to 14", "gold_route": "technical_query"},
        {"query": "typescript strict mode errors", "gold_route": "technical_query"},
        {"query": "react native build failed android", "gold_route": "technical_query"},
        {"query": "jenkins pipeline failing at build stage", "gold_route": "technical_query"},
        {"query": "git merge conflict resolve kaise kare", "gold_route": "technical_query"},
        {"query": "ssl certificate expired renewal", "gold_route": "technical_query"},
        {"query": "lambda function timeout error", "gold_route": "technical_query"},
        {"query": "kafka consumer lag alert", "gold_route": "technical_query"},
        {"query": "elasticsearch cluster red status", "gold_route": "technical_query"},
        {"query": "how to optimize sql query", "gold_route": "technical_query"},
        {"query": "mongo db indexing strategy", "gold_route": "technical_query"},
        {"query": "spring boot application.properties profile", "gold_route": "technical_query"},
        {"query": "flutter pub get fail", "gold_route": "technical_query"},
        {"query": "django static files not loading", "gold_route": "technical_query"},
        
        # Agent Query (10)
        {"query": "book a flight to delhi", "gold_route": "agent_query"},
        {"query": "kal subah 10 baje ki meeting schedule karo", "gold_route": "agent_query"},
        {"query": "create a Jira ticket for this bug", "gold_route": "agent_query"},
        {"query": "remind me to call John at 5 PM", "gold_route": "agent_query"},
        {"query": "send an email to team@company.com", "gold_route": "agent_query"},
        {"query": "fetch latest logs for production server", "gold_route": "agent_query"},
        {"query": "start the deployment pipeline", "gold_route": "agent_query"},
        {"query": "mera account balance check karo", "gold_route": "agent_query"},
        {"query": "restart the staging environment", "gold_route": "agent_query"},
        {"query": "generate a weekly report and email it", "gold_route": "agent_query"}
    ]
    
    out_file = os.path.join(RESULTS_DIR, "router_ground_truth.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)
    print(f"Created {len(ground_truth)} ground truth examples in {out_file}")

if __name__ == "__main__":
    main()
