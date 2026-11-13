import ast

def check_syntax(code: str):
    try:
        ast.parse(code)

        return {
            "status": "success",
            "message": "No syntax errors found"
        }

    except SyntaxError as error:
        return {
            "status": "error",
            "message": error.msg,
            "line": error.lineno,
            "column": error.offset
        }
    