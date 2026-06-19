from langgraph.graph import StateGraph, END
from src.retrieval.state import GraphState
from src.retrieval.nodes import route_query, retrieve, grade_documents, generate, rewrite, generate_cached, contextualize_query, load_memory, save_memory, check_cache, embed_query, graph_decision, graph_expansion, fuse_and_rerank

def decide_route(state):
    intent = state.get("route", "technical_query")
    if intent in ["greeting", "faq"]:
        return "generate_cached"
    if intent in ["conversational", "followup", "personal"] or state.get("need_memory", False):
        return "load_memory"
    return "retrieve"

def decide_cache(state):
    if state.get("route") == "cached":
        return "save_memory"
    return "route_query"

def decide_grade(state):
    if state.get("route") == "no" and state.get("rewrite_count", 0) < 1:
        return "rewrite"
    if state.get("route") == "no":
        return "generate"
    return "graph_decision"

def decide_graph(state):
    if state.get("need_graph", False):
        return "graph_expansion"
    return "generate"

workflow = StateGraph(GraphState)

workflow.add_node("embed_query", embed_query)
workflow.add_node("load_memory", load_memory)
workflow.add_node("contextualize_query", contextualize_query)
workflow.add_node("check_cache", check_cache)
workflow.add_node("route_query", route_query)
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("graph_decision", graph_decision)
workflow.add_node("graph_expansion", graph_expansion)
workflow.add_node("fuse_and_rerank", fuse_and_rerank)
workflow.add_node("generate", generate)
workflow.add_node("rewrite", rewrite)
workflow.add_node("generate_cached", generate_cached)
workflow.add_node("save_memory", save_memory)

workflow.set_entry_point("embed_query")
workflow.add_edge("embed_query", "check_cache")
workflow.add_conditional_edges("check_cache", decide_cache, {"save_memory": "save_memory", "route_query": "route_query"})
workflow.add_conditional_edges("route_query", decide_route, {"generate_cached": "generate_cached", "load_memory": "load_memory", "retrieve": "retrieve"})
workflow.add_edge("load_memory", "contextualize_query")
workflow.add_edge("contextualize_query", "retrieve")

workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges("grade_documents", decide_grade, {"graph_decision": "graph_decision", "rewrite": "rewrite", "generate": "generate"})
workflow.add_conditional_edges("graph_decision", decide_graph, {"graph_expansion": "graph_expansion", "generate": "generate"})
workflow.add_edge("graph_expansion", "fuse_and_rerank")
workflow.add_edge("fuse_and_rerank", "generate")

workflow.add_edge("rewrite", "retrieve")
workflow.add_edge("generate_cached", "save_memory")
workflow.add_edge("generate", END)
workflow.add_edge("save_memory", END)

crag_app = workflow.compile()
