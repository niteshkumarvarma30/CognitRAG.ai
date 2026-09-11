import ast
import os
import re
from typing import List, Dict, Any, Optional

class PythonASTVisitor(ast.NodeVisitor):
    def __init__(self, filepath: str, lines: List[str]):
        self.filepath = filepath
        self.lines = lines
        self.classes = []
        self.functions = []
        self.imports = []
        self.calls = []
        self.current_class = None

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            self.imports.append({
                "module": alias.name,
                "name": alias.asname or alias.name,
                "line": node.lineno
            })
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            self.imports.append({
                "module": module,
                "name": alias.name,
                "alias": alias.asname or alias.name,
                "line": node.lineno
            })
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef):
        prev_class = self.current_class
        self.current_class = node.name
        
        docstring = ast.get_docstring(node) or ""
        bases = [getattr(b, "id", getattr(b, "attr", str(b))) for b in node.bases]
        
        end_line = getattr(node, "end_lineno", node.lineno + len(node.body))
        raw_code = "\n".join(self.lines[node.lineno - 1 : end_line])

        class_info = {
            "name": node.name,
            "docstring": docstring,
            "bases": bases,
            "start_line": node.lineno,
            "end_line": end_line,
            "raw_code": raw_code,
            "filepath": self.filepath
        }
        self.classes.append(class_info)

        self.generic_visit(node)
        self.current_class = prev_class

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self._process_func(node, is_async=False)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self._process_func(node, is_async=True)

    def _process_func(self, node, is_async: bool):
        docstring = ast.get_docstring(node) or ""
        args = [arg.arg for arg in node.args.args]
        end_line = getattr(node, "end_lineno", node.lineno + len(node.body))
        raw_code = "\n".join(self.lines[node.lineno - 1 : end_line])

        func_info = {
            "name": node.name,
            "is_async": is_async,
            "parent_class": self.current_class,
            "arguments": args,
            "docstring": docstring,
            "start_line": node.lineno,
            "end_line": end_line,
            "raw_code": raw_code,
            "filepath": self.filepath
        }
        self.functions.append(func_info)
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        func_name = None
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
        elif isinstance(node.func, ast.Attribute):
            func_name = node.func.attr

        if func_name:
            self.calls.append({
                "callee": func_name,
                "caller_class": self.current_class,
                "line": node.lineno,
                "filepath": self.filepath
            })
        self.generic_visit(node)


class GenericCodeParser:
    """
    Regex and token based parser for JavaScript, TypeScript, Go, Rust, and Java.
    Extracts functions, classes, and exported interfaces.
    """
    @staticmethod
    def parse_source(filepath: str, content: str) -> Dict[str, Any]:
        lines = content.splitlines()
        classes = []
        functions = []
        imports = []

        # Find classes/structs
        class_regex = re.compile(r'(?:export\s+)?(?:class|interface|struct)\s+([A-Za-z0-9_]+)', re.MULTILINE)
        for m in class_regex.finditer(content):
            start_pos = m.start()
            line_no = content[:start_pos].count('\n') + 1
            classes.append({
                "name": m.group(1),
                "docstring": "",
                "start_line": line_no,
                "end_line": min(line_no + 30, len(lines)),
                "raw_code": "\n".join(lines[line_no - 1 : min(line_no + 30, len(lines))]),
                "filepath": filepath
            })

        # Find functions / methods / arrow functions
        func_regex = re.compile(r'(?:export\s+)?(?:async\s+)?(?:function\s+([A-Za-z0-9_]+)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+([A-Za-z0-9_]+)|func\s+(?:\([^)]+\)\s*)?([A-Za-z0-9_]+))', re.MULTILINE)
        for m in func_regex.finditer(content):
            name = m.group(1) or m.group(2) or m.group(3) or m.group(4)
            if not name:
                continue
            line_no = content[:m.start()].count('\n') + 1
            functions.append({
                "name": name,
                "is_async": "async" in m.group(0),
                "arguments": [],
                "docstring": "",
                "start_line": line_no,
                "end_line": min(line_no + 25, len(lines)),
                "raw_code": "\n".join(lines[line_no - 1 : min(line_no + 25, len(lines))]),
                "filepath": filepath
            })

        # Find imports
        import_regex = re.compile(r'(?:import|from)\s+["\']([^"\']+)["\']|(?:const|let|var)\s+.*\s*=\s*require\(["\']([^"\']+)["\']\)', re.MULTILINE)
        for m in import_regex.finditer(content):
            mod = m.group(1) or m.group(2)
            if mod:
                line_no = content[:m.start()].count('\n') + 1
                imports.append({"module": mod, "name": mod, "line": line_no})

        return {
            "filepath": filepath,
            "loc": len(lines),
            "classes": classes,
            "functions": functions,
            "imports": imports,
            "calls": []
        }


def parse_code_file(filepath: str, content: str) -> Dict[str, Any]:
    """
    Dispatcher: runs Python AST if .py, else GenericCodeParser.
    """
    lines = content.splitlines()
    loc = len(lines)
    
    if filepath.endswith(".py"):
        try:
            tree = ast.parse(content, filename=filepath)
            visitor = PythonASTVisitor(filepath, lines)
            visitor.visit(tree)
            return {
                "filepath": filepath,
                "loc": loc,
                "classes": visitor.classes,
                "functions": visitor.functions,
                "imports": visitor.imports,
                "calls": visitor.calls
            }
        except Exception:
            # Fallback to generic parser on syntax errors in Python file
            pass

    return GenericCodeParser.parse_source(filepath, content)
