from langgraph.graph import StateGraph, END
from src.retrieval.state import GraphState
from src.retrieval.nodes import route_query, retrieve, grade_documents, generate, rewrite, generate_cached, contextualize_query, load_memory, save_memory, check_cache

def decide_route(state):
    if state["route"] in ["greeting", "faq"]:
        return "generate_cached"
    return "retrieve"

def decide_cache(state):
    if state["route"] == "cached":
        return "save_memory"
    return "route_query"

def decide_grade(state):
    if state["route"] == "no" and state.get("rewrite_count", 0) < 1:
        return "rewrite"
    return "generate"

workflow = StateGraph(GraphState)

workflow.add_node("load_memory", load_memory)
workflow.add_node("contextualize_query", contextualize_query)
workflow.add_node("check_cache", check_cache)
workflow.add_node("route_query", route_query)
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.add_node("rewrite", rewrite)
workflow.add_node("generate_cached", generate_cached)
workflow.add_node("save_memory", save_memory)

workflow.set_entry_point("load_memory")
workflow.add_edge("load_memory", "contextualize_query")
workflow.add_edge("contextualize_query", "check_cache")
workflow.add_conditional_edges("check_cache", decide_cache, {"save_memory": "save_memory", "route_query": "route_query"})
workflow.add_conditional_edges("route_query", decide_route, {"generate_cached": "generate_cached", "retrieve": "retrieve"})
workflow.add_edge("generate_cached", "save_memory")

workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges("grade_documents", decide_grade, {"generate": "generate", "rewrite": "rewrite"})

workflow.add_edge("rewrite", "retrieve")
workflow.add_edge("generate", "save_memory")
workflow.add_edge("save_memory", END)

crag_app = workflow.compile()
