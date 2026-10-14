from pydantic import BaseModel, Field
from typing import Optional, List, Any

class EvalExample(BaseModel):
    """
    Standardized evaluation record shape.
    Used across all datasets (RAGTruth, EntRAG, ALCE, COMI-LINGUA, CodeMixed-QA, HiFACTMix)
    so downstream processing, judging, and scoring remain completely dataset-agnostic.
    """
    example_id: str
    dataset_name: str          # 'ragtruth' | 'alce' | 'entrag' | 'comi-lingua' | 'codemixed-qa' | 'hifactmix'
    task_type: str             # 'citation' | 'hallucination' | 'contradiction' | 'language_id' | 'qa'
    input_query: Optional[str] = None
    input_context: Optional[str] = None   # source passage(s) provided to the system
    gold_answer: Optional[str] = None
    gold_citations: Optional[List[str]] = None   # ground-truth supporting spans/doc ids
    gold_label: Optional[str] = None      # for classification-style tasks (language tag, contradiction y/n, SUPPORTED)
    language_tag: Optional[str] = "en"    # 'en' | 'hi-latn' | 'mixed'
    metadata: Optional[dict] = Field(default_factory=dict)
