"""
Dataset Loaders for Golden Benchmark Sets
"""
from Evaluation.loaders.ragtruth_loader import load_ragtruth, load_ragtruth_balanced
from Evaluation.loaders.entrag_loader import load_entrag
from Evaluation.loaders.alce_loader import load_alce
from Evaluation.loaders.comilingua_loader import load_comi_lingua
from Evaluation.loaders.codemixed_qa_loader import load_codemixed_qa
from Evaluation.loaders.hifactmix_loader import load_hifactmix

__all__ = [
    "load_ragtruth",
    "load_ragtruth_balanced",
    "load_entrag",
    "load_alce",
    "load_comi_lingua",
    "load_codemixed_qa",
    "load_hifactmix"
]
